import { logger } from "../utils/logger.js";

interface Coordinates {
  lat: number;
  lng: number;
}

interface Territory {
  id: string;
  name: string;
  assignedTo: string;
  assignedToName: string;
  boundaries: Coordinates[];
  color: string;
  metrics: TerritoryMetrics;
}

interface TerritoryMetrics {
  leadCount: number;
  activeDeals: number;
  revenue: number;
  conversionRate: number;
  avgDealSize: number;
}

interface Lead {
  id: string;
  name: string;
  location: Coordinates;
  value?: number;
  status?: string;
}

interface SalesRep {
  id: string;
  name: string;
  email: string;
  capacity: number; // max leads they can handle
  currentLoad: number;
  specialties?: string[];
}

interface TerritoryAssignment {
  territoryId: string;
  leadId: string;
  assignedTo: string;
  assignmentReason: string;
}

/**
 * Territory Mapping Service
 *
 * Features:
 * - Auto-assign leads to territories based on location
 * - Balance workload across sales reps
 * - Visualize territory coverage
 * - Track territory performance metrics
 */
export class TerritoryMappingService {
  private readonly COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#6366F1",
  ];

  /**
   * Check if a point is inside a polygon (territory)
   * Uses ray casting algorithm
   */
  isPointInTerritory(point: Coordinates, boundaries: Coordinates[]): boolean {
    let inside = false;
    const n = boundaries.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = boundaries[i].lng;
      const yi = boundaries[i].lat;
      const xj = boundaries[j].lng;
      const yj = boundaries[j].lat;

      const intersect =
        yi > point.lat !== yj > point.lat &&
        point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Find which territory a lead belongs to
   */
  findTerritoryForLead(lead: Lead, territories: Territory[]): Territory | null {
    for (const territory of territories) {
      if (this.isPointInTerritory(lead.location, territory.boundaries)) {
        return territory;
      }
    }
    return null;
  }

  /**
   * Auto-assign leads to territories and reps
   */
  autoAssignLeads(
    leads: Lead[],
    territories: Territory[],
    salesReps: SalesRep[],
  ): TerritoryAssignment[] {
    const assignments: TerritoryAssignment[] = [];
    const repLoads = new Map<string, number>();

    // Initialize rep loads
    salesReps.forEach((rep) => repLoads.set(rep.id, rep.currentLoad));

    for (const lead of leads) {
      const territory = this.findTerritoryForLead(lead, territories);

      if (territory) {
        // Assign to territory owner if they have capacity
        const ownerLoad = repLoads.get(territory.assignedTo) || 0;
        const owner = salesReps.find((r) => r.id === territory.assignedTo);

        if (owner && ownerLoad < owner.capacity) {
          assignments.push({
            territoryId: territory.id,
            leadId: lead.id,
            assignedTo: territory.assignedTo,
            assignmentReason: `Lead in ${territory.name} territory`,
          });
          repLoads.set(territory.assignedTo, ownerLoad + 1);
        } else {
          // Find rep with lowest load who can cover this territory
          const availableRep = this.findAvailableRep(salesReps, repLoads);
          if (availableRep) {
            assignments.push({
              territoryId: territory.id,
              leadId: lead.id,
              assignedTo: availableRep.id,
              assignmentReason: `Overflow assignment - ${territory.name} territory`,
            });
            const currentLoad = repLoads.get(availableRep.id) || 0;
            repLoads.set(availableRep.id, currentLoad + 1);
          }
        }
      } else {
        // Lead outside all territories - assign to rep with lowest load
        const availableRep = this.findAvailableRep(salesReps, repLoads);
        if (availableRep) {
          assignments.push({
            territoryId: "unassigned",
            leadId: lead.id,
            assignedTo: availableRep.id,
            assignmentReason:
              "Outside defined territories - assigned to available rep",
          });
          const currentLoad = repLoads.get(availableRep.id) || 0;
          repLoads.set(availableRep.id, currentLoad + 1);
        }
      }
    }

    logger.info(`Auto-assigned ${assignments.length} leads`);
    return assignments;
  }

  /**
   * Find the rep with the lowest workload
   */
  private findAvailableRep(
    salesReps: SalesRep[],
    currentLoads: Map<string, number>,
  ): SalesRep | null {
    let bestRep: SalesRep | null = null;
    let lowestLoad = Infinity;

    for (const rep of salesReps) {
      const load = currentLoads.get(rep.id) || 0;
      if (load < rep.capacity && load < lowestLoad) {
        lowestLoad = load;
        bestRep = rep;
      }
    }

    return bestRep;
  }

  /**
   * Generate territory boundaries from a center point
   * Creates a roughly circular territory
   */
  generateCircularTerritory(
    center: Coordinates,
    radiusMiles: number,
    points: number = 8,
  ): Coordinates[] {
    const boundaries: Coordinates[] = [];
    const radiusLat = radiusMiles / 69; // approx miles per degree lat
    const radiusLng =
      radiusMiles / (69 * Math.cos((center.lat * Math.PI) / 180));

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      boundaries.push({
        lat: center.lat + radiusLat * Math.sin(angle),
        lng: center.lng + radiusLng * Math.cos(angle),
      });
    }

    return boundaries;
  }

  /**
   * Suggest optimal territory divisions based on lead distribution
   */
  suggestTerritoryDivisions(
    leads: Lead[],
    numTerritories: number,
  ): Array<{ center: Coordinates; leads: Lead[] }> {
    // Simple k-means clustering for territory suggestions
    if (leads.length === 0) return [];

    // Initialize centroids
    const centroids: Coordinates[] = [];
    const step = Math.floor(leads.length / numTerritories);

    for (let i = 0; i < numTerritories; i++) {
      const lead = leads[Math.min(i * step, leads.length - 1)];
      centroids.push({ ...lead.location });
    }

    // K-means iterations
    const maxIterations = 10;
    let clusters: Lead[][] = [];

    for (let iter = 0; iter < maxIterations; iter++) {
      // Assign leads to nearest centroid
      clusters = Array.from({ length: numTerritories }, () => []);

      for (const lead of leads) {
        let minDist = Infinity;
        let nearestIdx = 0;

        for (let i = 0; i < centroids.length; i++) {
          const dist = this.calculateDistance(lead.location, centroids[i]);
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = i;
          }
        }

        clusters[nearestIdx].push(lead);
      }

      // Update centroids
      for (let i = 0; i < centroids.length; i++) {
        if (clusters[i].length > 0) {
          centroids[i] = {
            lat:
              clusters[i].reduce((sum, l) => sum + l.location.lat, 0) /
              clusters[i].length,
            lng:
              clusters[i].reduce((sum, l) => sum + l.location.lng, 0) /
              clusters[i].length,
          };
        }
      }
    }

    return centroids.map((center, i) => ({
      center,
      leads: clusters[i],
    }));
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(a: Coordinates, b: Coordinates): number {
    const dLat = b.lat - a.lat;
    const dLng = b.lng - a.lng;
    return Math.sqrt(dLat * dLat + dLng * dLng);
  }

  /**
   * Calculate territory metrics
   */
  calculateTerritoryMetrics(
    territory: Territory,
    leads: Lead[],
  ): TerritoryMetrics {
    const territoryLeads = leads.filter((lead) =>
      this.isPointInTerritory(lead.location, territory.boundaries),
    );

    const activeDeals = territoryLeads.filter(
      (l) => l.status === "active",
    ).length;
    const wonDeals = territoryLeads.filter((l) => l.status === "won");
    const totalValue = territoryLeads.reduce(
      (sum, l) => sum + (l.value || 0),
      0,
    );

    return {
      leadCount: territoryLeads.length,
      activeDeals,
      revenue: wonDeals.reduce((sum, l) => sum + (l.value || 0), 0),
      conversionRate:
        territoryLeads.length > 0
          ? (wonDeals.length / territoryLeads.length) * 100
          : 0,
      avgDealSize:
        wonDeals.length > 0
          ? wonDeals.reduce((sum, l) => sum + (l.value || 0), 0) /
            wonDeals.length
          : 0,
    };
  }

  /**
   * Balance workload across territories
   */
  analyzeWorkloadBalance(
    territories: Territory[],
    salesReps: SalesRep[],
  ): {
    balanced: boolean;
    recommendations: string[];
    repUtilization: Array<{ rep: string; utilization: number }>;
  } {
    const recommendations: string[] = [];
    const repUtilization: Array<{ rep: string; utilization: number }> = [];

    let totalLeads = 0;
    const repLeads = new Map<string, number>();

    for (const territory of territories) {
      totalLeads += territory.metrics.leadCount;
      const current = repLeads.get(territory.assignedTo) || 0;
      repLeads.set(territory.assignedTo, current + territory.metrics.leadCount);
    }

    const avgLeadsPerRep = totalLeads / salesReps.length;

    for (const rep of salesReps) {
      const leads = repLeads.get(rep.id) || 0;
      const utilization = (leads / rep.capacity) * 100;
      repUtilization.push({ rep: rep.name, utilization });

      if (utilization > 100) {
        recommendations.push(
          `${rep.name} is overloaded (${utilization.toFixed(0)}% capacity) - consider reassigning some leads`,
        );
      } else if (utilization < 50) {
        recommendations.push(
          `${rep.name} has capacity for more leads (${utilization.toFixed(0)}% utilized)`,
        );
      }
    }

    const balanced = repUtilization.every(
      (r) => r.utilization >= 50 && r.utilization <= 100,
    );

    return { balanced, recommendations, repUtilization };
  }

  /**
   * Generate GeoJSON for territory visualization
   */
  territoriesToGeoJSON(territories: Territory[]): object {
    return {
      type: "FeatureCollection",
      features: territories.map((territory, index) => ({
        type: "Feature",
        properties: {
          id: territory.id,
          name: territory.name,
          assignedTo: territory.assignedToName,
          color: territory.color || this.COLORS[index % this.COLORS.length],
          ...territory.metrics,
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              ...territory.boundaries.map((b) => [b.lng, b.lat]),
              [territory.boundaries[0].lng, territory.boundaries[0].lat], // Close the polygon
            ],
          ],
        },
      })),
    };
  }
}

export const territoryMappingService = new TerritoryMappingService();
