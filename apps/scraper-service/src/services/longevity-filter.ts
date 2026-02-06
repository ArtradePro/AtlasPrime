import { logger } from "../utils/logger.js";

interface BusinessData {
  id: string;
  name: string;
  foundedYear?: number;
  yearsInBusiness?: number;
  industry?: string;
  employeeCount?: string;
  googleRating?: number;
  googleReviewCount?: number;
  website?: string;
}

interface LongevityFilterConfig {
  minYearsInBusiness: number;
  allowUnknownAge: boolean;
  industryOverrides?: Record<string, number>; // Industry-specific thresholds
  bypassForHighValue?: {
    enabled: boolean;
    minEmployees?: number;
    minReviewCount?: number;
    minRating?: number;
  };
}

interface LongevityAssessment {
  passes: boolean;
  yearsInBusiness: number | null;
  foundedYear: number | null;
  confidence: "verified" | "estimated" | "unknown";
  reasons: string[];
  bypassReason?: string;
  stabilityScore: number; // 0-100
  recommendation: "accept" | "reject" | "manual_review";
}

const DEFAULT_CONFIG: LongevityFilterConfig = {
  minYearsInBusiness: 10,
  allowUnknownAge: false,
  industryOverrides: {
    // Some industries mature faster
    technology: 5,
    software: 5,
    saas: 5,
    // Medical/healthcare - regulated but can establish quickly
    medical: 5,
    "medical practice": 5,
    "medical clinic": 5,
    dental: 5,
    "physical therapy": 5,
    chiropractic: 5,
    optometry: 5,
    podiatry: 5,
    podiatrist: 5,
    // Professional services need more track record
    legal: 10,
    healthcare: 10, // General healthcare (hospitals, large systems)
    "financial services": 12,
    // Restaurants have high turnover
    restaurant: 8,
    "food service": 8,
  },
  bypassForHighValue: {
    enabled: true,
    minEmployees: 50,
    minReviewCount: 500,
    minRating: 4.5,
  },
};

/**
 * Longevity Filter Service
 *
 * Filters out businesses that don't meet minimum age requirements.
 * Ensures you only target stable, established businesses that:
 * 1. Have survived market cycles
 * 2. Have proven business models
 * 3. Can afford premium services
 * 4. Are likely to have established budgets
 */
export class LongevityFilterService {
  private config: LongevityFilterConfig;

  constructor(config?: Partial<LongevityFilterConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update filter configuration
   */
  setConfig(config: Partial<LongevityFilterConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info(
      `Longevity filter config updated: minYears=${this.config.minYearsInBusiness}`,
    );
  }

  /**
   * Assess a single business for longevity requirements
   */
  assess(business: BusinessData): LongevityAssessment {
    const currentYear = new Date().getFullYear();
    const reasons: string[] = [];

    // Determine years in business
    let yearsInBusiness: number | null = null;
    let foundedYear: number | null = business.foundedYear || null;
    let confidence: "verified" | "estimated" | "unknown" = "unknown";

    if (business.yearsInBusiness !== undefined) {
      yearsInBusiness = business.yearsInBusiness;
      confidence = "verified";
    } else if (business.foundedYear) {
      yearsInBusiness = currentYear - business.foundedYear;
      confidence = "verified";
    }

    // Get minimum threshold (check for industry override)
    const minYears = this.getMinYearsForIndustry(business.industry);

    // Check if passes basic threshold
    let passes = false;
    let bypassReason: string | undefined;

    if (yearsInBusiness !== null) {
      if (yearsInBusiness >= minYears) {
        passes = true;
        reasons.push(
          `${yearsInBusiness} years in business meets ${minYears}+ year requirement`,
        );
      } else {
        reasons.push(
          `${yearsInBusiness} years in business below ${minYears} year minimum`,
        );
      }
    } else {
      // Unknown age
      if (this.config.allowUnknownAge) {
        passes = true;
        reasons.push("Unknown business age - allowed by configuration");
      } else {
        reasons.push("Unknown business age - cannot verify longevity");
      }
    }

    // Check for high-value bypass conditions
    if (!passes && this.config.bypassForHighValue?.enabled) {
      const bypass = this.checkHighValueBypass(business);
      if (bypass.shouldBypass) {
        passes = true;
        bypassReason = bypass.reason;
        reasons.push(`High-value bypass: ${bypass.reason}`);
      }
    }

    // Calculate stability score
    const stabilityScore = this.calculateStabilityScore(
      business,
      yearsInBusiness,
    );

    // Determine recommendation
    let recommendation: "accept" | "reject" | "manual_review" = "reject";
    if (passes) {
      recommendation = "accept";
    } else if (stabilityScore >= 50 || bypassReason) {
      recommendation = "manual_review";
    }

    logger.debug(
      `Longevity assessment for "${business.name}": ` +
        `years=${yearsInBusiness}, passes=${passes}, score=${stabilityScore}`,
    );

    return {
      passes,
      yearsInBusiness,
      foundedYear,
      confidence,
      reasons,
      bypassReason,
      stabilityScore,
      recommendation,
    };
  }

  /**
   * Filter a list of businesses
   */
  filterBusinesses(
    businesses: BusinessData[],
    options?: { includeManualReview?: boolean },
  ): {
    accepted: BusinessData[];
    rejected: BusinessData[];
    manualReview: BusinessData[];
    stats: {
      total: number;
      accepted: number;
      rejected: number;
      manualReview: number;
      avgYearsAccepted: number;
    };
  } {
    const accepted: BusinessData[] = [];
    const rejected: BusinessData[] = [];
    const manualReview: BusinessData[] = [];

    for (const business of businesses) {
      const assessment = this.assess(business);

      if (assessment.recommendation === "accept") {
        accepted.push(business);
      } else if (assessment.recommendation === "manual_review") {
        if (options?.includeManualReview) {
          manualReview.push(business);
        } else {
          rejected.push(business);
        }
      } else {
        rejected.push(business);
      }
    }

    // Calculate stats
    const acceptedYears = accepted
      .map(
        (b) =>
          b.yearsInBusiness ||
          (b.foundedYear ? new Date().getFullYear() - b.foundedYear : 0),
      )
      .filter((y) => y > 0);

    const avgYearsAccepted =
      acceptedYears.length > 0
        ? Math.round(
            acceptedYears.reduce((a, b) => a + b, 0) / acceptedYears.length,
          )
        : 0;

    const stats = {
      total: businesses.length,
      accepted: accepted.length,
      rejected: rejected.length,
      manualReview: manualReview.length,
      avgYearsAccepted,
    };

    logger.info(
      `Longevity filter: ${stats.accepted}/${stats.total} accepted, ` +
        `${stats.rejected} rejected, ${stats.manualReview} for review`,
    );

    return { accepted, rejected, manualReview, stats };
  }

  /**
   * Get minimum years threshold for industry
   */
  private getMinYearsForIndustry(industry?: string): number {
    if (!industry || !this.config.industryOverrides) {
      return this.config.minYearsInBusiness;
    }

    const lowerIndustry = industry.toLowerCase();

    for (const [key, years] of Object.entries(this.config.industryOverrides)) {
      if (lowerIndustry.includes(key.toLowerCase())) {
        return years;
      }
    }

    return this.config.minYearsInBusiness;
  }

  /**
   * Check if business qualifies for high-value bypass
   */
  private checkHighValueBypass(business: BusinessData): {
    shouldBypass: boolean;
    reason?: string;
  } {
    const bypass = this.config.bypassForHighValue;
    if (!bypass?.enabled) {
      return { shouldBypass: false };
    }

    // Check employee count
    if (bypass.minEmployees && business.employeeCount) {
      const employees = this.parseEmployeeCount(business.employeeCount);
      if (employees >= bypass.minEmployees) {
        return {
          shouldBypass: true,
          reason: `Large company (${business.employeeCount} employees)`,
        };
      }
    }

    // Check review count (strong market presence)
    if (bypass.minReviewCount && business.googleReviewCount) {
      if (business.googleReviewCount >= bypass.minReviewCount) {
        return {
          shouldBypass: true,
          reason: `Strong market presence (${business.googleReviewCount} reviews)`,
        };
      }
    }

    // Check combined rating + reviews
    if (
      bypass.minRating &&
      business.googleRating &&
      business.googleRating >= bypass.minRating &&
      business.googleReviewCount &&
      business.googleReviewCount >= 100
    ) {
      return {
        shouldBypass: true,
        reason: `Excellent reputation (${business.googleRating}★ with ${business.googleReviewCount} reviews)`,
      };
    }

    return { shouldBypass: false };
  }

  /**
   * Calculate stability score (0-100)
   */
  private calculateStabilityScore(
    business: BusinessData,
    yearsInBusiness: number | null,
  ): number {
    let score = 0;

    // Years in business (up to 40 points)
    if (yearsInBusiness !== null) {
      score += Math.min(yearsInBusiness * 2, 40);
    }

    // Google rating (up to 20 points)
    if (business.googleRating) {
      score += (business.googleRating / 5) * 20;
    }

    // Review count (up to 20 points)
    if (business.googleReviewCount) {
      score += Math.min(business.googleReviewCount / 50, 20);
    }

    // Has website (10 points)
    if (business.website) {
      score += 10;
    }

    // Employee count (up to 10 points)
    if (business.employeeCount) {
      const employees = this.parseEmployeeCount(business.employeeCount);
      score += Math.min(employees / 10, 10);
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Parse employee count string to number
   */
  private parseEmployeeCount(count: string): number {
    // Handle ranges like "50-100", "100+", "51-200"
    const match = count.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}

export const longevityFilterService = new LongevityFilterService();
