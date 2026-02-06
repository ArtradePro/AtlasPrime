import { logger } from "../utils/logger.js";

interface Review {
  text: string;
  rating: number;
  date?: string;
  author?: string;
}

interface SentimentResult {
  totalReviews: number;
  averageRating: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topThemes: Theme[];
  painPoints: PainPoint[];
  competitorMentions: CompetitorMention[];
  aiSummary: string;
  outreachAngles: string[];
}

interface Theme {
  theme: string;
  sentiment: "positive" | "negative" | "mixed";
  frequency: number;
  exampleQuotes: string[];
}

interface PainPoint {
  issue: string;
  frequency: number;
  severity: "high" | "medium" | "low";
  opportunity: string;
}

interface CompetitorMention {
  competitor: string;
  sentiment: string;
  count: number;
}

// Common pain point patterns
const PAIN_POINT_PATTERNS: Record<
  string,
  {
    keywords: string[];
    opportunity: string;
    severity: "high" | "medium" | "low";
  }
> = {
  slow_service: {
    keywords: [
      "slow",
      "wait",
      "waited",
      "long time",
      "forever",
      "hours",
      "delayed",
    ],
    opportunity: "Offer efficiency/workflow optimization solutions",
    severity: "high",
  },
  poor_communication: {
    keywords: [
      "never called back",
      "no response",
      "didn't call",
      "ignored",
      "no communication",
      "hard to reach",
    ],
    opportunity: "CRM or communication system implementation",
    severity: "high",
  },
  pricing_issues: {
    keywords: [
      "expensive",
      "overpriced",
      "overcharged",
      "hidden fees",
      "cost too much",
      "rip off",
    ],
    opportunity: "Value proposition or pricing strategy consulting",
    severity: "medium",
  },
  quality_concerns: {
    keywords: [
      "poor quality",
      "bad quality",
      "defective",
      "broken",
      "didn't work",
      "fell apart",
    ],
    opportunity: "Quality control or process improvement",
    severity: "high",
  },
  staff_issues: {
    keywords: [
      "rude",
      "unprofessional",
      "unhelpful",
      "unfriendly",
      "attitude",
      "disrespectful",
    ],
    opportunity: "Staff training or customer service improvement",
    severity: "high",
  },
  scheduling_problems: {
    keywords: [
      "appointment",
      "reschedule",
      "canceled",
      "no show",
      "missed",
      "booking",
    ],
    opportunity: "Online scheduling/booking system",
    severity: "medium",
  },
  cleanliness: {
    keywords: ["dirty", "unclean", "messy", "filthy", "gross", "unsanitary"],
    opportunity: "Operations/facilities improvement",
    severity: "high",
  },
  outdated: {
    keywords: [
      "outdated",
      "old",
      "dated",
      "needs updating",
      "old fashioned",
      "behind the times",
    ],
    opportunity: "Modernization/digital transformation",
    severity: "medium",
  },
  website_issues: {
    keywords: [
      "website",
      "online",
      "couldn't find",
      "no website",
      "hard to navigate",
    ],
    opportunity: "Website redesign or digital presence improvement",
    severity: "medium",
  },
  parking: {
    keywords: ["parking", "no parking", "hard to park", "parking lot"],
    opportunity: "Location/accessibility consulting",
    severity: "low",
  },
};

// Positive theme patterns
const POSITIVE_PATTERNS: Record<string, string[]> = {
  great_service: [
    "excellent service",
    "great service",
    "amazing service",
    "best service",
    "wonderful service",
  ],
  friendly_staff: [
    "friendly",
    "helpful",
    "professional",
    "kind",
    "courteous",
    "welcoming",
  ],
  quality_work: [
    "quality",
    "excellent work",
    "great job",
    "perfect",
    "amazing results",
  ],
  fair_pricing: [
    "fair price",
    "reasonable",
    "good value",
    "worth it",
    "affordable",
  ],
  fast_service: ["fast", "quick", "efficient", "on time", "prompt"],
  clean_facility: ["clean", "spotless", "well maintained", "organized"],
  recommend: [
    "recommend",
    "will be back",
    "returning customer",
    "loyal customer",
  ],
};

/**
 * Review Sentiment Analysis Service
 *
 * Analyzes business reviews to extract:
 * - Overall sentiment breakdown
 * - Key themes (positive and negative)
 * - Specific pain points with sales opportunities
 * - Competitor mentions
 * - AI-generated summary and outreach angles
 */
export class ReviewSentimentService {
  /**
   * Analyze a set of reviews
   */
  async analyze(
    reviews: Review[],
    businessName: string,
  ): Promise<SentimentResult> {
    logger.info(`Analyzing ${reviews.length} reviews for ${businessName}`);

    const sentimentBreakdown = this.calculateSentimentBreakdown(reviews);
    const themes = this.extractThemes(reviews);
    const painPoints = this.extractPainPoints(reviews);
    const competitorMentions = this.findCompetitorMentions(
      reviews,
      businessName,
    );
    const aiSummary = this.generateSummary(
      reviews,
      themes,
      painPoints,
      businessName,
    );
    const outreachAngles = this.generateOutreachAngles(
      painPoints,
      themes,
      sentimentBreakdown,
    );

    return {
      totalReviews: reviews.length,
      averageRating: this.calculateAverageRating(reviews),
      sentimentBreakdown,
      topThemes: themes.slice(0, 10),
      painPoints: painPoints.slice(0, 5),
      competitorMentions,
      aiSummary,
      outreachAngles,
    };
  }

  /**
   * Calculate sentiment breakdown from ratings
   */
  private calculateSentimentBreakdown(reviews: Review[]): {
    positive: number;
    neutral: number;
    negative: number;
  } {
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    for (const review of reviews) {
      if (review.rating >= 4) positive++;
      else if (review.rating === 3) neutral++;
      else negative++;
    }

    const total = reviews.length || 1;
    return {
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100),
    };
  }

  /**
   * Calculate average rating
   */
  private calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  /**
   * Extract themes from reviews
   */
  private extractThemes(reviews: Review[]): Theme[] {
    const themeMap = new Map<
      string,
      {
        count: number;
        quotes: string[];
        positiveCount: number;
        negativeCount: number;
      }
    >();

    // Extract negative themes from pain points
    for (const [themeName, pattern] of Object.entries(PAIN_POINT_PATTERNS)) {
      let count = 0;
      const quotes: string[] = [];

      for (const review of reviews) {
        const text = review.text.toLowerCase();
        if (pattern.keywords.some((keyword) => text.includes(keyword))) {
          count++;
          if (quotes.length < 3) {
            quotes.push(this.extractQuote(review.text, pattern.keywords));
          }
        }
      }

      if (count > 0) {
        themeMap.set(themeName, {
          count,
          quotes,
          positiveCount: 0,
          negativeCount: count,
        });
      }
    }

    // Extract positive themes
    for (const [themeName, keywords] of Object.entries(POSITIVE_PATTERNS)) {
      let count = 0;
      const quotes: string[] = [];

      for (const review of reviews) {
        if (review.rating < 4) continue; // Only consider positive reviews
        const text = review.text.toLowerCase();
        if (keywords.some((keyword) => text.includes(keyword))) {
          count++;
          if (quotes.length < 3) {
            quotes.push(this.extractQuote(review.text, keywords));
          }
        }
      }

      if (count > 0) {
        const existing = themeMap.get(themeName);
        if (existing) {
          existing.positiveCount = count;
          existing.quotes.push(...quotes.slice(0, 3 - existing.quotes.length));
        } else {
          themeMap.set(themeName, {
            count,
            quotes,
            positiveCount: count,
            negativeCount: 0,
          });
        }
      }
    }

    // Convert to array and sort by frequency
    return Array.from(themeMap.entries())
      .map(([theme, data]) => ({
        theme: this.formatThemeName(theme),
        sentiment: this.determineThemeSentiment(
          data.positiveCount,
          data.negativeCount,
        ),
        frequency: data.count,
        exampleQuotes: data.quotes,
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Extract pain points with sales opportunities
   */
  private extractPainPoints(reviews: Review[]): PainPoint[] {
    const painPoints: PainPoint[] = [];

    for (const [issue, pattern] of Object.entries(PAIN_POINT_PATTERNS)) {
      let frequency = 0;

      for (const review of reviews) {
        const text = review.text.toLowerCase();
        if (pattern.keywords.some((keyword) => text.includes(keyword))) {
          frequency++;
        }
      }

      if (frequency > 0) {
        painPoints.push({
          issue: this.formatThemeName(issue),
          frequency,
          severity: pattern.severity,
          opportunity: pattern.opportunity,
        });
      }
    }

    return painPoints.sort((a, b) => {
      // Sort by severity first, then frequency
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.frequency - a.frequency;
    });
  }

  /**
   * Find competitor mentions in reviews
   */
  private findCompetitorMentions(
    reviews: Review[],
    businessName: string,
  ): CompetitorMention[] {
    // Common phrases that indicate competitor comparison
    const comparisonPhrases = [
      "better than",
      "worse than",
      "compared to",
      "unlike",
      "switched from",
      "went to",
      "tried",
      "used to go to",
      "prefer",
      "should have gone to",
    ];

    const competitors = new Map<
      string,
      { positive: number; negative: number; neutral: number }
    >();
    const businessNameLower = businessName.toLowerCase();

    for (const review of reviews) {
      const text = review.text.toLowerCase();

      // Look for comparison phrases followed by potential business names
      for (const phrase of comparisonPhrases) {
        if (text.includes(phrase)) {
          // Extract potential competitor name (simplified - in production, use NER)
          const afterPhrase = text.split(phrase)[1];
          if (afterPhrase) {
            const words = afterPhrase
              .trim()
              .split(/[.,!?\s]+/)
              .slice(0, 3)
              .join(" ");
            if (words.length > 2 && !words.includes(businessNameLower)) {
              const sentiment =
                review.rating >= 4
                  ? "positive"
                  : review.rating <= 2
                    ? "negative"
                    : "neutral";
              const existing = competitors.get(words) || {
                positive: 0,
                negative: 0,
                neutral: 0,
              };
              existing[sentiment]++;
              competitors.set(words, existing);
            }
          }
        }
      }
    }

    return Array.from(competitors.entries())
      .map(([competitor, counts]) => ({
        competitor,
        sentiment:
          counts.positive > counts.negative
            ? "positive"
            : counts.negative > counts.positive
              ? "negative"
              : "neutral",
        count: counts.positive + counts.negative + counts.neutral,
      }))
      .filter((c) => c.count >= 2) // Only include if mentioned at least twice
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Generate AI summary of reviews
   */
  private generateSummary(
    reviews: Review[],
    themes: Theme[],
    painPoints: PainPoint[],
    businessName: string,
  ): string {
    const avgRating = this.calculateAverageRating(reviews);
    const totalReviews = reviews.length;

    const positiveThemes = themes
      .filter((t) => t.sentiment === "positive")
      .slice(0, 3);
    const negativeThemes = themes
      .filter((t) => t.sentiment === "negative")
      .slice(0, 3);

    let summary = `${businessName} has ${totalReviews} reviews with an average rating of ${avgRating}/5. `;

    if (positiveThemes.length > 0) {
      summary += `Customers praise their ${positiveThemes.map((t) => t.theme.toLowerCase()).join(", ")}. `;
    }

    if (negativeThemes.length > 0) {
      summary += `Common complaints include ${negativeThemes.map((t) => t.theme.toLowerCase()).join(", ")}. `;
    }

    if (painPoints.length > 0) {
      const topPain = painPoints[0];
      summary += `The most significant issue is "${topPain.issue}" mentioned ${topPain.frequency} times - this represents a ${topPain.severity} priority opportunity.`;
    }

    return summary;
  }

  /**
   * Generate outreach angles based on review analysis
   */
  private generateOutreachAngles(
    painPoints: PainPoint[],
    themes: Theme[],
    sentimentBreakdown: { positive: number; neutral: number; negative: number },
  ): string[] {
    const angles: string[] = [];

    // Pain point-based angles
    for (const painPoint of painPoints.slice(0, 3)) {
      angles.push(
        `${painPoint.frequency} reviews mention "${painPoint.issue}" - ${painPoint.opportunity}`,
      );
    }

    // Sentiment-based angles
    if (sentimentBreakdown.negative > 20) {
      angles.push(
        `${sentimentBreakdown.negative}% negative reviews indicate room for service improvement`,
      );
    }

    // Positive leverage
    const strongPositives = themes.filter(
      (t) => t.sentiment === "positive" && t.frequency > 5,
    );
    if (strongPositives.length > 0) {
      angles.push(
        `Strong reputation for ${strongPositives[0].theme.toLowerCase()} - could leverage with testimonial marketing`,
      );
    }

    return angles;
  }

  /**
   * Extract a relevant quote containing the keyword
   */
  private extractQuote(text: string, keywords: string[]): string {
    const sentences = text.split(/[.!?]+/);
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (keywords.some((k) => lower.includes(k))) {
        const trimmed = sentence.trim();
        return trimmed.length > 150
          ? trimmed.substring(0, 150) + "..."
          : trimmed;
      }
    }
    return text.substring(0, 100) + "...";
  }

  /**
   * Format theme name for display
   */
  private formatThemeName(name: string): string {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Determine overall theme sentiment
   */
  private determineThemeSentiment(
    positiveCount: number,
    negativeCount: number,
  ): "positive" | "negative" | "mixed" {
    if (positiveCount > 0 && negativeCount > 0) return "mixed";
    if (positiveCount > negativeCount) return "positive";
    return "negative";
  }
}

export const reviewSentimentService = new ReviewSentimentService();
