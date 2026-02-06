import { logger } from "../utils/logger.js";

interface BusinessData {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  website?: string;
  coordinates?: { lat: number; lng: number };
}

interface ChainCluster {
  clusterId: string;
  canonicalName: string;
  confidence: number;
  totalLocations: number;
  members: {
    id: string;
    name: string;
    role: "headquarters" | "branch" | "franchise";
    matchReasons: string[];
  }[];
  metadata: {
    phonePatterns: string[];
    addressCities: string[];
    websiteDomain?: string;
  };
}

interface ChainDetectionResult {
  isChain: boolean;
  confidence: number;
  clusterId?: string;
  totalLocations: number;
  role: "headquarters" | "branch" | "franchise" | "independent";
  matchReasons: string[];
}

/**
 * Chain Intelligence Service
 *
 * Detects franchises and chain businesses by analyzing:
 * 1. Business name similarity (fuzzy matching)
 * 2. Phone number patterns (shared prefix, sequential numbers)
 * 3. Address clustering (same city/region, proximity)
 * 4. Website domain matching
 * 5. Common franchise indicators in names
 */
export class ChainIntelligenceService {
  private readonly COMMON_FRANCHISE_INDICATORS = [
    // Exact franchise markers
    "franchise",
    "franchisee",
    "licensed",
    // Location indicators
    "#",
    "no.",
    "store",
    "location",
    "branch",
    "unit",
    // Regional markers that suggest chains
    "east",
    "west",
    "north",
    "south",
    "central",
    "downtown",
    "midtown",
    // Common chain suffixes
    "of",
    "at",
    "-",
  ];

  private readonly KNOWN_CHAIN_PATTERNS = [
    // Fast food patterns
    /mcdonald'?s?/i,
    /subway/i,
    /starbucks/i,
    /dunkin'?/i,
    // Service patterns
    /jiffy\s*lube/i,
    /great\s*clips/i,
    /h&r\s*block/i,
    /the\s*ups\s*store/i,
    // Fitness
    /planet\s*fitness/i,
    /anytime\s*fitness/i,
    /orangetheory/i,
  ];

  private readonly NAME_SIMILARITY_THRESHOLD = 0.75;
  private readonly PHONE_PREFIX_LENGTH = 7; // Area code + exchange
  private readonly PROXIMITY_RADIUS_MILES = 50;

  /**
   * Analyze a single business against existing data to detect chain membership
   */
  async detectChain(
    business: BusinessData,
    existingBusinesses: BusinessData[],
  ): Promise<ChainDetectionResult> {
    const matchReasons: string[] = [];
    let confidence = 0;
    let matchedClusterId: string | undefined;
    const potentialMatches: BusinessData[] = [];

    // 1. Check against known chain patterns
    const knownChainMatch = this.matchKnownChain(business.name);
    if (knownChainMatch) {
      matchReasons.push(`Known chain pattern: ${knownChainMatch}`);
      confidence += 0.4;
    }

    // 2. Check for franchise indicators in name
    const franchiseIndicators = this.detectFranchiseIndicators(business.name);
    if (franchiseIndicators.length > 0) {
      matchReasons.push(
        `Franchise indicators: ${franchiseIndicators.join(", ")}`,
      );
      confidence += 0.2;
    }

    // 3. Find similar names in existing businesses
    for (const existing of existingBusinesses) {
      if (existing.id === business.id) continue;

      const similarityScore = this.calculateNameSimilarity(
        business.name,
        existing.name,
      );
      if (similarityScore >= this.NAME_SIMILARITY_THRESHOLD) {
        potentialMatches.push(existing);
        matchReasons.push(
          `Similar name: "${existing.name}" (${Math.round(similarityScore * 100)}% match)`,
        );
        confidence += 0.15;
      }
    }

    // 4. Check phone number patterns
    if (business.phone) {
      const phoneMatches = this.findPhonePatternMatches(
        business.phone,
        existingBusinesses,
      );
      if (phoneMatches.length > 0) {
        matchReasons.push(
          `Shared phone pattern with ${phoneMatches.length} businesses`,
        );
        confidence += 0.1;
        potentialMatches.push(
          ...phoneMatches.filter((m) => !potentialMatches.includes(m)),
        );
      }
    }

    // 5. Check website domain
    if (business.website) {
      const domainMatches = this.findDomainMatches(
        business.website,
        existingBusinesses,
      );
      if (domainMatches.length > 0) {
        matchReasons.push(
          `Shared website domain with ${domainMatches.length} businesses`,
        );
        confidence += 0.25;
        potentialMatches.push(
          ...domainMatches.filter((m) => !potentialMatches.includes(m)),
        );
      }
    }

    // 6. Check geographic clustering
    if (business.coordinates) {
      const proximityMatches = this.findProximityMatches(
        business,
        potentialMatches,
      );
      if (proximityMatches.length > 0) {
        matchReasons.push(
          `Geographic cluster: ${proximityMatches.length} locations within ${this.PROXIMITY_RADIUS_MILES} miles`,
        );
        confidence += 0.1;
      }
    }

    // Cap confidence at 1.0
    confidence = Math.min(confidence, 1.0);

    // Determine chain status
    const isChain = confidence >= 0.5 || potentialMatches.length >= 2;
    const totalLocations = isChain ? potentialMatches.length + 1 : 1;

    // Determine role
    let role: "headquarters" | "branch" | "franchise" | "independent" =
      "independent";
    if (isChain) {
      role = this.determineBusinessRole(business, potentialMatches);

      // Generate cluster ID based on canonical name
      const canonicalName = this.extractCanonicalName(business.name);
      matchedClusterId = this.generateClusterId(canonicalName);
    }

    logger.info(
      `Chain detection for "${business.name}": isChain=${isChain}, confidence=${confidence.toFixed(2)}, locations=${totalLocations}`,
    );

    return {
      isChain,
      confidence,
      clusterId: matchedClusterId,
      totalLocations,
      role,
      matchReasons,
    };
  }

  /**
   * Cluster multiple businesses into chain groups
   */
  async clusterBusinesses(businesses: BusinessData[]): Promise<ChainCluster[]> {
    const clusters: Map<string, ChainCluster> = new Map();
    const processed = new Set<string>();

    for (const business of businesses) {
      if (processed.has(business.id)) continue;

      const result = await this.detectChain(business, businesses);

      if (result.isChain && result.clusterId) {
        if (!clusters.has(result.clusterId)) {
          clusters.set(result.clusterId, {
            clusterId: result.clusterId,
            canonicalName: this.extractCanonicalName(business.name),
            confidence: result.confidence,
            totalLocations: 0,
            members: [],
            metadata: {
              phonePatterns: [],
              addressCities: [],
              websiteDomain: this.extractDomain(business.website),
            },
          });
        }

        const cluster = clusters.get(result.clusterId)!;
        cluster.members.push({
          id: business.id,
          name: business.name,
          role: result.role as "headquarters" | "branch" | "franchise",
          matchReasons: result.matchReasons,
        });
        cluster.totalLocations = cluster.members.length;

        if (business.city) {
          cluster.metadata.addressCities.push(business.city);
        }
        if (business.phone) {
          const prefix = business.phone
            .replace(/\D/g, "")
            .substring(0, this.PHONE_PREFIX_LENGTH);
          if (!cluster.metadata.phonePatterns.includes(prefix)) {
            cluster.metadata.phonePatterns.push(prefix);
          }
        }

        processed.add(business.id);
      }
    }

    const clusterArray = Array.from(clusters.values());
    logger.info(
      `Clustered ${businesses.length} businesses into ${clusterArray.length} chain groups`,
    );

    return clusterArray;
  }

  /**
   * Calculate name similarity using Levenshtein-based algorithm
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    const clean1 = this.normalizeBusinessName(name1);
    const clean2 = this.normalizeBusinessName(name2);

    if (clean1 === clean2) return 1.0;

    // Extract canonical names and compare
    const canonical1 = this.extractCanonicalName(name1);
    const canonical2 = this.extractCanonicalName(name2);

    if (canonical1 === canonical2) return 0.95;

    // Levenshtein distance
    const maxLen = Math.max(clean1.length, clean2.length);
    if (maxLen === 0) return 1.0;

    const distance = this.levenshteinDistance(clean1, clean2);
    return 1 - distance / maxLen;
  }

  /**
   * Normalize business name for comparison
   */
  private normalizeBusinessName(name: string): string {
    return name
      .toLowerCase()
      .replace(/['']/g, "'")
      .replace(/[^\w\s']/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Extract canonical name (remove location-specific parts)
   */
  private extractCanonicalName(name: string): string {
    let canonical = this.normalizeBusinessName(name);

    // Remove common location suffixes
    canonical = canonical
      .replace(/\s*#\d+\s*/g, "")
      .replace(
        /\s*-\s*(east|west|north|south|central|downtown|midtown).*$/i,
        "",
      )
      .replace(/\s*of\s+[\w\s]+$/i, "")
      .replace(/\s*at\s+[\w\s]+$/i, "")
      .replace(/\s*(store|location|branch|unit)\s*\d*\s*$/i, "")
      .trim();

    return canonical;
  }

  /**
   * Generate consistent cluster ID from canonical name
   */
  private generateClusterId(canonicalName: string): string {
    return `chain_${canonicalName.replace(/\s+/g, "_").toLowerCase()}`;
  }

  /**
   * Check if name matches known chain patterns
   */
  private matchKnownChain(name: string): string | null {
    for (const pattern of this.KNOWN_CHAIN_PATTERNS) {
      if (pattern.test(name)) {
        const match = name.match(pattern);
        return match ? match[0] : null;
      }
    }
    return null;
  }

  /**
   * Detect franchise indicators in business name
   */
  private detectFranchiseIndicators(name: string): string[] {
    const found: string[] = [];
    const lowerName = name.toLowerCase();

    for (const indicator of this.COMMON_FRANCHISE_INDICATORS) {
      if (indicator === "#") {
        if (/#\d+/.test(name)) found.push("location number (#)");
      } else if (lowerName.includes(indicator)) {
        found.push(indicator);
      }
    }

    // Check for "City + Brand" pattern (e.g., "Miami Subway")
    if (/^[A-Z][a-z]+\s+[A-Z]/.test(name)) {
      const parts = name.split(/\s+/);
      if (parts.length >= 2) {
        // First word might be a city
        found.push("possible city prefix pattern");
      }
    }

    return [...new Set(found)];
  }

  /**
   * Find businesses with matching phone patterns
   */
  private findPhonePatternMatches(
    phone: string,
    businesses: BusinessData[],
  ): BusinessData[] {
    const cleanPhone = phone.replace(/\D/g, "");
    const prefix = cleanPhone.substring(0, this.PHONE_PREFIX_LENGTH);

    return businesses.filter((b) => {
      if (!b.phone) return false;
      const otherPrefix = b.phone
        .replace(/\D/g, "")
        .substring(0, this.PHONE_PREFIX_LENGTH);
      return prefix === otherPrefix;
    });
  }

  /**
   * Find businesses with matching website domains
   */
  private findDomainMatches(
    website: string,
    businesses: BusinessData[],
  ): BusinessData[] {
    const domain = this.extractDomain(website);
    if (!domain) return [];

    return businesses.filter((b) => {
      if (!b.website) return false;
      return this.extractDomain(b.website) === domain;
    });
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url?: string): string | undefined {
    if (!url) return undefined;
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return undefined;
    }
  }

  /**
   * Find businesses within proximity
   */
  private findProximityMatches(
    business: BusinessData,
    candidates: BusinessData[],
  ): BusinessData[] {
    if (!business.coordinates) return [];

    return candidates.filter((c) => {
      if (!c.coordinates) return false;
      const distance = this.calculateDistance(
        business.coordinates!.lat,
        business.coordinates!.lng,
        c.coordinates.lat,
        c.coordinates.lng,
      );
      return distance <= this.PROXIMITY_RADIUS_MILES;
    });
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Determine the role of a business within a chain
   */
  private determineBusinessRole(
    business: BusinessData,
    siblings: BusinessData[],
  ): "headquarters" | "branch" | "franchise" {
    const name = business.name.toLowerCase();

    // Check for headquarters indicators
    if (
      name.includes("headquarter") ||
      name.includes("corporate") ||
      name.includes("main office") ||
      name.includes("hq")
    ) {
      return "headquarters";
    }

    // Check for franchise indicators
    if (
      name.includes("franchise") ||
      name.includes("licensed") ||
      /#\d+/.test(business.name)
    ) {
      return "franchise";
    }

    // Default to branch
    return "branch";
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }
}

export const chainIntelligenceService = new ChainIntelligenceService();
