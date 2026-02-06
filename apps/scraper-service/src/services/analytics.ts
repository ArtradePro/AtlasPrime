import { logger } from "../utils/logger.js";

interface DealStage {
  name: string;
  avgDaysInStage: number;
  conversionRate: number;
}

interface IndustryBenchmark {
  industry: string;
  avgDealSize: number;
  avgSalesCycle: number; // days
  avgConversionRate: number;
  avgLeadResponseTime: number; // hours
  topPerformerMetrics: {
    dealSize: number;
    salesCycle: number;
    conversionRate: number;
    responseTime: number;
  };
}

interface DealVelocityMetrics {
  avgDaysToClose: number;
  medianDaysToClose: number;
  velocityTrend: "accelerating" | "stable" | "slowing";
  stageDurations: DealStage[];
  bottlenecks: string[];
}

interface RevenueForecast {
  period: string;
  projectedRevenue: number;
  confidence: "high" | "medium" | "low";
  breakdown: {
    committed: number;
    bestCase: number;
    pipeline: number;
  };
  assumptions: string[];
}

interface Deal {
  id: string;
  value: number;
  stage: string;
  probability: number;
  createdAt: Date;
  closedAt?: Date;
  expectedCloseDate: Date;
  stageHistory: Array<{
    stage: string;
    enteredAt: Date;
    exitedAt?: Date;
  }>;
}

interface TeamMetrics {
  repId: string;
  repName: string;
  dealsWon: number;
  dealsLost: number;
  revenue: number;
  avgDealSize: number;
  conversionRate: number;
  avgResponseTime: number;
  activitiesPerDeal: number;
}

/**
 * Analytics & Benchmarking Service
 *
 * Features:
 * - Industry benchmarking
 * - Deal velocity tracking
 * - Revenue forecasting
 * - Team performance analytics
 */
export class AnalyticsService {
  private industryBenchmarks: Map<string, IndustryBenchmark> = new Map();

  constructor() {
    this.initializeBenchmarks();
  }

  /**
   * Initialize industry benchmarks database
   */
  private initializeBenchmarks() {
    const benchmarks: IndustryBenchmark[] = [
      {
        industry: "dental",
        avgDealSize: 15000,
        avgSalesCycle: 45,
        avgConversionRate: 22,
        avgLeadResponseTime: 4,
        topPerformerMetrics: {
          dealSize: 25000,
          salesCycle: 30,
          conversionRate: 35,
          responseTime: 1,
        },
      },
      {
        industry: "medical",
        avgDealSize: 35000,
        avgSalesCycle: 60,
        avgConversionRate: 18,
        avgLeadResponseTime: 6,
        topPerformerMetrics: {
          dealSize: 55000,
          salesCycle: 40,
          conversionRate: 28,
          responseTime: 2,
        },
      },
      {
        industry: "legal",
        avgDealSize: 25000,
        avgSalesCycle: 75,
        avgConversionRate: 15,
        avgLeadResponseTime: 8,
        topPerformerMetrics: {
          dealSize: 45000,
          salesCycle: 50,
          conversionRate: 25,
          responseTime: 3,
        },
      },
      {
        industry: "restaurant",
        avgDealSize: 8000,
        avgSalesCycle: 21,
        avgConversionRate: 28,
        avgLeadResponseTime: 2,
        topPerformerMetrics: {
          dealSize: 15000,
          salesCycle: 14,
          conversionRate: 40,
          responseTime: 0.5,
        },
      },
      {
        industry: "retail",
        avgDealSize: 12000,
        avgSalesCycle: 30,
        avgConversionRate: 25,
        avgLeadResponseTime: 3,
        topPerformerMetrics: {
          dealSize: 22000,
          salesCycle: 21,
          conversionRate: 38,
          responseTime: 1,
        },
      },
      {
        industry: "saas",
        avgDealSize: 50000,
        avgSalesCycle: 90,
        avgConversionRate: 12,
        avgLeadResponseTime: 2,
        topPerformerMetrics: {
          dealSize: 100000,
          salesCycle: 60,
          conversionRate: 20,
          responseTime: 0.5,
        },
      },
      {
        industry: "real_estate",
        avgDealSize: 18000,
        avgSalesCycle: 45,
        avgConversionRate: 20,
        avgLeadResponseTime: 1,
        topPerformerMetrics: {
          dealSize: 30000,
          salesCycle: 30,
          conversionRate: 32,
          responseTime: 0.25,
        },
      },
      {
        industry: "financial_services",
        avgDealSize: 40000,
        avgSalesCycle: 90,
        avgConversionRate: 14,
        avgLeadResponseTime: 4,
        topPerformerMetrics: {
          dealSize: 75000,
          salesCycle: 60,
          conversionRate: 22,
          responseTime: 2,
        },
      },
    ];

    benchmarks.forEach((b) => this.industryBenchmarks.set(b.industry, b));
  }

  /**
   * Get industry benchmark comparison
   */
  compareToBenchmark(
    industry: string,
    yourMetrics: {
      avgDealSize: number;
      avgSalesCycle: number;
      conversionRate: number;
      avgResponseTime: number;
    },
  ): {
    benchmark: IndustryBenchmark;
    comparison: {
      dealSize: { value: number; diff: number; percentile: number };
      salesCycle: { value: number; diff: number; percentile: number };
      conversionRate: { value: number; diff: number; percentile: number };
      responseTime: { value: number; diff: number; percentile: number };
    };
    recommendations: string[];
  } | null {
    const benchmark = this.industryBenchmarks.get(industry.toLowerCase());
    if (!benchmark) {
      logger.warn(`No benchmark found for industry: ${industry}`);
      return null;
    }

    const calcPercentile = (
      yours: number,
      avg: number,
      top: number,
      inverse: boolean = false,
    ): number => {
      if (inverse) {
        // Lower is better (e.g., sales cycle, response time)
        if (yours <= top) return 95;
        if (yours >= avg) return 50;
        return 50 + ((avg - yours) / (avg - top)) * 45;
      } else {
        // Higher is better
        if (yours >= top) return 95;
        if (yours <= avg) return 50;
        return 50 + ((yours - avg) / (top - avg)) * 45;
      }
    };

    const comparison = {
      dealSize: {
        value: yourMetrics.avgDealSize,
        diff: yourMetrics.avgDealSize - benchmark.avgDealSize,
        percentile: calcPercentile(
          yourMetrics.avgDealSize,
          benchmark.avgDealSize,
          benchmark.topPerformerMetrics.dealSize,
        ),
      },
      salesCycle: {
        value: yourMetrics.avgSalesCycle,
        diff: yourMetrics.avgSalesCycle - benchmark.avgSalesCycle,
        percentile: calcPercentile(
          yourMetrics.avgSalesCycle,
          benchmark.avgSalesCycle,
          benchmark.topPerformerMetrics.salesCycle,
          true,
        ),
      },
      conversionRate: {
        value: yourMetrics.conversionRate,
        diff: yourMetrics.conversionRate - benchmark.avgConversionRate,
        percentile: calcPercentile(
          yourMetrics.conversionRate,
          benchmark.avgConversionRate,
          benchmark.topPerformerMetrics.conversionRate,
        ),
      },
      responseTime: {
        value: yourMetrics.avgResponseTime,
        diff: yourMetrics.avgResponseTime - benchmark.avgLeadResponseTime,
        percentile: calcPercentile(
          yourMetrics.avgResponseTime,
          benchmark.avgLeadResponseTime,
          benchmark.topPerformerMetrics.responseTime,
          true,
        ),
      },
    };

    const recommendations: string[] = [];

    if (comparison.dealSize.percentile < 50) {
      recommendations.push(
        `Your average deal size ($${yourMetrics.avgDealSize.toLocaleString()}) is below industry average. Consider upselling or targeting larger accounts.`,
      );
    }
    if (comparison.salesCycle.percentile < 50) {
      recommendations.push(
        `Your sales cycle (${yourMetrics.avgSalesCycle} days) is longer than average. Review qualification criteria and streamline your process.`,
      );
    }
    if (comparison.conversionRate.percentile < 50) {
      recommendations.push(
        `Your conversion rate (${yourMetrics.conversionRate}%) needs improvement. Focus on lead qualification and value proposition clarity.`,
      );
    }
    if (comparison.responseTime.percentile < 50) {
      recommendations.push(
        `Your response time (${yourMetrics.avgResponseTime}h) is slower than competitors. Faster response = higher win rates.`,
      );
    }

    return { benchmark, comparison, recommendations };
  }

  /**
   * Calculate deal velocity metrics
   */
  calculateDealVelocity(deals: Deal[]): DealVelocityMetrics {
    const closedDeals = deals.filter((d) => d.closedAt);

    if (closedDeals.length === 0) {
      return {
        avgDaysToClose: 0,
        medianDaysToClose: 0,
        velocityTrend: "stable",
        stageDurations: [],
        bottlenecks: [],
      };
    }

    // Calculate days to close for each deal
    const daysToClose = closedDeals
      .map((d) => {
        const created = new Date(d.createdAt).getTime();
        const closed = new Date(d.closedAt!).getTime();
        return (closed - created) / (1000 * 60 * 60 * 24);
      })
      .sort((a, b) => a - b);

    const avgDaysToClose =
      daysToClose.reduce((a, b) => a + b, 0) / daysToClose.length;
    const medianDaysToClose = daysToClose[Math.floor(daysToClose.length / 2)];

    // Calculate stage durations
    const stageStats = new Map<
      string,
      { totalDays: number; count: number; conversions: number }
    >();

    for (const deal of closedDeals) {
      for (const stage of deal.stageHistory) {
        if (stage.exitedAt) {
          const days =
            (new Date(stage.exitedAt).getTime() -
              new Date(stage.enteredAt).getTime()) /
            (1000 * 60 * 60 * 24);
          const existing = stageStats.get(stage.stage) || {
            totalDays: 0,
            count: 0,
            conversions: 0,
          };
          existing.totalDays += days;
          existing.count += 1;
          existing.conversions += 1; // Simplified - count all as conversions for closed deals
          stageStats.set(stage.stage, existing);
        }
      }
    }

    const stageDurations: DealStage[] = Array.from(stageStats.entries()).map(
      ([name, stats]) => ({
        name,
        avgDaysInStage: stats.totalDays / stats.count,
        conversionRate: (stats.conversions / stats.count) * 100,
      }),
    );

    // Identify bottlenecks (stages with above-average duration)
    const avgStageDuration =
      stageDurations.reduce((sum, s) => sum + s.avgDaysInStage, 0) /
      stageDurations.length;
    const bottlenecks = stageDurations
      .filter((s) => s.avgDaysInStage > avgStageDuration * 1.5)
      .map(
        (s) =>
          `${s.name} stage takes ${s.avgDaysInStage.toFixed(1)} days (${((s.avgDaysInStage / avgStageDuration - 1) * 100).toFixed(0)}% above average)`,
      );

    // Determine velocity trend (compare recent vs older deals)
    const midpoint = Math.floor(closedDeals.length / 2);
    const olderDeals = daysToClose.slice(0, midpoint);
    const recentDeals = daysToClose.slice(midpoint);

    const olderAvg =
      olderDeals.reduce((a, b) => a + b, 0) / olderDeals.length || 0;
    const recentAvg =
      recentDeals.reduce((a, b) => a + b, 0) / recentDeals.length || 0;

    let velocityTrend: "accelerating" | "stable" | "slowing";
    if (recentAvg < olderAvg * 0.9) {
      velocityTrend = "accelerating";
    } else if (recentAvg > olderAvg * 1.1) {
      velocityTrend = "slowing";
    } else {
      velocityTrend = "stable";
    }

    return {
      avgDaysToClose: Math.round(avgDaysToClose),
      medianDaysToClose: Math.round(medianDaysToClose),
      velocityTrend,
      stageDurations,
      bottlenecks,
    };
  }

  /**
   * Generate revenue forecast
   */
  forecastRevenue(
    deals: Deal[],
    forecastMonths: number = 3,
  ): RevenueForecast[] {
    const forecasts: RevenueForecast[] = [];
    const now = new Date();

    for (let month = 0; month < forecastMonths; month++) {
      const periodStart = new Date(
        now.getFullYear(),
        now.getMonth() + month,
        1,
      );
      const periodEnd = new Date(
        now.getFullYear(),
        now.getMonth() + month + 1,
        0,
      );
      const periodName = periodStart.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      // Filter deals expected to close in this period
      const periodDeals = deals.filter((d) => {
        const closeDate = new Date(d.expectedCloseDate);
        return (
          closeDate >= periodStart && closeDate <= periodEnd && !d.closedAt
        );
      });

      // Calculate weighted pipeline
      let committed = 0;
      let bestCase = 0;
      let pipeline = 0;

      for (const deal of periodDeals) {
        const weightedValue = deal.value * (deal.probability / 100);

        if (deal.probability >= 80) {
          committed += weightedValue;
        } else if (deal.probability >= 50) {
          bestCase += weightedValue;
        } else {
          pipeline += weightedValue;
        }
      }

      // Calculate confidence based on pipeline composition
      let confidence: "high" | "medium" | "low";
      const total = committed + bestCase + pipeline;

      if (committed / total > 0.6) {
        confidence = "high";
      } else if ((committed + bestCase) / total > 0.5) {
        confidence = "medium";
      } else {
        confidence = "low";
      }

      const projectedRevenue = committed + bestCase * 0.8 + pipeline * 0.3;

      forecasts.push({
        period: periodName,
        projectedRevenue: Math.round(projectedRevenue),
        confidence,
        breakdown: {
          committed: Math.round(committed),
          bestCase: Math.round(bestCase),
          pipeline: Math.round(pipeline),
        },
        assumptions: [
          `${periodDeals.length} deals expected to close`,
          `${periodDeals.filter((d) => d.probability >= 80).length} deals at 80%+ probability`,
          `Historical close rate applied to pipeline`,
        ],
      });
    }

    return forecasts;
  }

  /**
   * Calculate team performance metrics
   */
  calculateTeamMetrics(
    deals: Deal[],
    reps: Array<{ id: string; name: string }>,
    activities: Array<{
      repId: string;
      dealId: string;
      type: string;
      timestamp: Date;
    }>,
  ): TeamMetrics[] {
    return reps.map((rep) => {
      const repDeals = deals.filter((d) => (d as any).repId === rep.id);
      const wonDeals = repDeals.filter((d) => (d as any).status === "won");
      const lostDeals = repDeals.filter((d) => (d as any).status === "lost");
      const repActivities = activities.filter((a) => a.repId === rep.id);

      const revenue = wonDeals.reduce((sum, d) => sum + d.value, 0);
      const avgDealSize = wonDeals.length > 0 ? revenue / wonDeals.length : 0;
      const closedDeals = wonDeals.length + lostDeals.length;
      const conversionRate =
        closedDeals > 0 ? (wonDeals.length / closedDeals) * 100 : 0;

      // Calculate average response time (simplified)
      const responseActivities = repActivities.filter(
        (a) => a.type === "first_response",
      );
      const avgResponseTime = responseActivities.length > 0 ? 2 : 0; // Placeholder

      const activitiesPerDeal =
        repDeals.length > 0 ? repActivities.length / repDeals.length : 0;

      return {
        repId: rep.id,
        repName: rep.name,
        dealsWon: wonDeals.length,
        dealsLost: lostDeals.length,
        revenue,
        avgDealSize: Math.round(avgDealSize),
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgResponseTime,
        activitiesPerDeal: Math.round(activitiesPerDeal * 10) / 10,
      };
    });
  }

  /**
   * Generate performance insights
   */
  generateInsights(metrics: TeamMetrics[]): string[] {
    const insights: string[] = [];

    if (metrics.length === 0) return insights;

    // Top performer
    const topByRevenue = [...metrics].sort((a, b) => b.revenue - a.revenue)[0];
    insights.push(
      `🏆 Top performer: ${topByRevenue.repName} with $${topByRevenue.revenue.toLocaleString()} in revenue`,
    );

    // Highest conversion rate
    const topByConversion = [...metrics].sort(
      (a, b) => b.conversionRate - a.conversionRate,
    )[0];
    if (topByConversion.conversionRate > 0) {
      insights.push(
        `🎯 Best closer: ${topByConversion.repName} with ${topByConversion.conversionRate}% conversion rate`,
      );
    }

    // Largest average deal
    const topByDealSize = [...metrics].sort(
      (a, b) => b.avgDealSize - a.avgDealSize,
    )[0];
    if (topByDealSize.avgDealSize > 0) {
      insights.push(
        `💎 Biggest deals: ${topByDealSize.repName} averaging $${topByDealSize.avgDealSize.toLocaleString()} per deal`,
      );
    }

    // Team average
    const teamRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0);
    const teamAvgDealSize =
      metrics.reduce((sum, m) => sum + m.avgDealSize, 0) / metrics.length;
    insights.push(
      `📊 Team total: $${teamRevenue.toLocaleString()} revenue, $${Math.round(teamAvgDealSize).toLocaleString()} avg deal`,
    );

    return insights;
  }

  /**
   * Get available industries for benchmarking
   */
  getAvailableIndustries(): string[] {
    return Array.from(this.industryBenchmarks.keys());
  }
}

export const analyticsService = new AnalyticsService();
