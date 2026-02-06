import { logger } from "../utils/logger.js";

interface Location {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  state?: string;
}

interface CompetitorInfo {
  name: string;
  address: string;
  distance: number;
  website?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
}

interface ProximityAlert {
  type: "new_competitor" | "competitor_expansion" | "competitor_closing";
  competitor: CompetitorInfo;
  affectedBusinessId: string;
  affectedBusinessName: string;
  urgency: "high" | "medium" | "low";
  details: string;
  suggestedAction: string;
}

interface NearbyBusinesses {
  competitors: CompetitorInfo[];
  totalFound: number;
  searchRadius: number;
}

/**
 * Competitor Proximity Alert Service
 *
 * Monitors for:
 * - New competitors opening near your leads
 * - Competitors expanding their presence
 * - Competitors closing (opportunity)
 * - Competitive density analysis
 */
export class CompetitorProximityService {
  private readonly EARTH_RADIUS_MILES = 3959;

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(loc1: Location, loc2: Location): number {
    const dLat = this.toRad(loc2.lat - loc1.lat);
    const dLon = this.toRad(loc2.lng - loc1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(loc1.lat)) *
        Math.cos(this.toRad(loc2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_MILES * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Find businesses within a radius
   */
  async findNearbyBusinesses(
    center: Location,
    radiusMiles: number,
    industry: string,
    existingBusinessIds: string[] = [],
  ): Promise<NearbyBusinesses> {
    logger.info(
      `Searching for ${industry} businesses within ${radiusMiles} miles`,
    );

    // In production, this would query Google Places API or similar
    /*
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${center.lat},${center.lng}`,
        radius: radiusMiles * 1609.34, // Convert to meters
        type: industry,
        key: process.env.GOOGLE_PLACES_API_KEY,
      },
    });
    
    const competitors = response.data.results.map(place => ({
      name: place.name,
      address: place.vicinity,
      distance: this.calculateDistance(center, {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      }),
      rating: place.rating,
      reviewCount: place.user_ratings_total,
    })).filter(c => !existingBusinessIds.includes(c.placeId));
    */

    // Mock response for development
    return {
      competitors: [],
      totalFound: 0,
      searchRadius: radiusMiles,
    };
  }

  /**
   * Check for new competitors and generate alerts
   */
  async checkForNewCompetitors(
    business: {
      id: string;
      name: string;
      location: Location;
      industry: string;
    },
    knownCompetitors: string[],
    radiusMiles: number = 5,
  ): Promise<ProximityAlert[]> {
    const alerts: ProximityAlert[] = [];

    const nearby = await this.findNearbyBusinesses(
      business.location,
      radiusMiles,
      business.industry,
      knownCompetitors,
    );

    for (const competitor of nearby.competitors) {
      const urgency = this.determineUrgency(
        competitor.distance,
        competitor.rating,
      );

      alerts.push({
        type: "new_competitor",
        competitor,
        affectedBusinessId: business.id,
        affectedBusinessName: business.name,
        urgency,
        details: `New ${business.industry} business "${competitor.name}" opened ${competitor.distance.toFixed(1)} miles away`,
        suggestedAction: this.generateSuggestedAction(competitor, urgency),
      });
    }

    return alerts;
  }

  /**
   * Analyze competitive density in an area
   */
  async analyzeCompetitiveDensity(
    center: Location,
    industry: string,
    radiusMiles: number = 10,
  ): Promise<{
    density: "low" | "medium" | "high" | "saturated";
    competitorCount: number;
    avgRating: number;
    marketOpportunity: string;
  }> {
    const nearby = await this.findNearbyBusinesses(
      center,
      radiusMiles,
      industry,
    );
    const count = nearby.totalFound;

    // Calculate density based on area
    const areaSqMiles = Math.PI * radiusMiles * radiusMiles;
    const densityPerSqMile = count / areaSqMiles;

    let density: "low" | "medium" | "high" | "saturated";
    let marketOpportunity: string;

    if (densityPerSqMile < 0.5) {
      density = "low";
      marketOpportunity = "Underserved market - high growth potential";
    } else if (densityPerSqMile < 2) {
      density = "medium";
      marketOpportunity = "Healthy competition - differentiation key";
    } else if (densityPerSqMile < 5) {
      density = "high";
      marketOpportunity = "Competitive market - focus on niche/quality";
    } else {
      density = "saturated";
      marketOpportunity =
        "Saturated market - consider expansion to other areas";
    }

    const avgRating =
      nearby.competitors.length > 0
        ? nearby.competitors.reduce((sum, c) => sum + (c.rating || 0), 0) /
          nearby.competitors.length
        : 0;

    return {
      density,
      competitorCount: count,
      avgRating: Math.round(avgRating * 10) / 10,
      marketOpportunity,
    };
  }

  /**
   * Find the closest competitors
   */
  findClosestCompetitors(
    businessLocation: Location,
    competitors: CompetitorInfo[],
    limit: number = 5,
  ): CompetitorInfo[] {
    return competitors.sort((a, b) => a.distance - b.distance).slice(0, limit);
  }

  /**
   * Generate competitive threat score
   */
  calculateThreatScore(competitor: CompetitorInfo): number {
    let score = 0;

    // Distance factor (closer = higher threat)
    if (competitor.distance < 1) score += 40;
    else if (competitor.distance < 3) score += 30;
    else if (competitor.distance < 5) score += 20;
    else score += 10;

    // Rating factor
    if (competitor.rating && competitor.rating >= 4.5) score += 30;
    else if (competitor.rating && competitor.rating >= 4.0) score += 20;
    else if (competitor.rating && competitor.rating >= 3.5) score += 10;

    // Review count factor (social proof)
    if (competitor.reviewCount && competitor.reviewCount >= 500) score += 30;
    else if (competitor.reviewCount && competitor.reviewCount >= 200)
      score += 20;
    else if (competitor.reviewCount && competitor.reviewCount >= 50)
      score += 10;

    return Math.min(score, 100);
  }

  /**
   * Determine alert urgency based on distance and rating
   */
  private determineUrgency(
    distance: number,
    rating?: number,
  ): "high" | "medium" | "low" {
    if (distance < 1 && rating && rating >= 4.5) return "high";
    if (distance < 2 || (rating && rating >= 4.0)) return "medium";
    return "low";
  }

  /**
   * Generate suggested action based on competitor threat
   */
  private generateSuggestedAction(
    competitor: CompetitorInfo,
    urgency: "high" | "medium" | "low",
  ): string {
    if (urgency === "high") {
      return `Immediate outreach recommended - competitor "${competitor.name}" poses significant threat. Highlight your unique value proposition and long-standing reputation.`;
    }
    if (urgency === "medium") {
      return `Schedule follow-up call to discuss competitive landscape. Use this as opportunity to strengthen relationship.`;
    }
    return `Monitor situation. Include competitive intelligence in next touchpoint.`;
  }

  /**
   * Monitor a list of businesses for competitor changes
   */
  async monitorBusinesses(
    businesses: Array<{
      id: string;
      name: string;
      location: Location;
      industry: string;
      knownCompetitors: string[];
    }>,
    radiusMiles: number = 5,
  ): Promise<ProximityAlert[]> {
    const allAlerts: ProximityAlert[] = [];

    for (const business of businesses) {
      const alerts = await this.checkForNewCompetitors(
        business,
        business.knownCompetitors,
        radiusMiles,
      );
      allAlerts.push(...alerts);
    }

    // Sort by urgency
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    allAlerts.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    logger.info(`Generated ${allAlerts.length} competitor alerts`);
    return allAlerts;
  }
}

export const competitorProximityService = new CompetitorProximityService();
