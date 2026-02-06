import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// AI Lead Scoring - Calculate score based on company data
export const calculateLeadScore = mutation({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) throw new Error("Company not found");

    // Calculate score based on multiple factors
    let score = 50; // Base score
    const factors: string[] = [];

    // Years in business (up to +20 points)
    if (company.yearsInBusiness) {
      if (company.yearsInBusiness >= 20) {
        score += 20;
        factors.push("Established business (20+ years)");
      } else if (company.yearsInBusiness >= 10) {
        score += 15;
        factors.push("Stable business (10+ years)");
      } else if (company.yearsInBusiness >= 5) {
        score += 10;
        factors.push("Growing business (5+ years)");
      } else {
        score += 5;
        factors.push("Newer business");
      }
    }

    // Google rating (+15 points max)
    if (company.googleRating) {
      if (company.googleRating >= 4.5) {
        score += 15;
        factors.push("Excellent reputation (4.5+ stars)");
      } else if (company.googleRating >= 4.0) {
        score += 10;
        factors.push("Good reputation (4.0+ stars)");
      } else if (company.googleRating >= 3.5) {
        score += 5;
        factors.push("Average reputation");
      }
    }

    // Review count (+10 points max)
    if (company.googleReviewCount) {
      if (company.googleReviewCount >= 100) {
        score += 10;
        factors.push("High engagement (100+ reviews)");
      } else if (company.googleReviewCount >= 50) {
        score += 7;
        factors.push("Good engagement (50+ reviews)");
      } else if (company.googleReviewCount >= 20) {
        score += 5;
        factors.push("Moderate engagement");
      }
    }

    // Website presence (+5 points)
    if (company.website) {
      score += 5;
      factors.push("Has website presence");
    }

    // Chain status (+5 points for chains)
    if (
      company.isChain &&
      company.totalLocations &&
      company.totalLocations > 1
    ) {
      score += 5 + Math.min(5, company.totalLocations);
      factors.push(
        `Multi-location business (${company.totalLocations} locations)`,
      );
    }

    // Cap score at 100
    score = Math.min(100, score);

    // Generate AI insights
    const insights = generateInsights(company, score, factors);

    // Update company with score
    await ctx.db.patch(args.companyId, {
      aiScore: score,
      aiInsights: insights,
      updatedAt: Date.now(),
    });

    return { score, factors, insights };
  },
});

// Batch score multiple leads
export const batchScoreLeads = mutation({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const companies = await ctx.db
      .query("companies")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .take(args.limit || 100);

    const results = [];

    for (const company of companies) {
      // Skip if already scored recently (within 24 hours)
      if (
        company.aiScore &&
        company.updatedAt &&
        Date.now() - company.updatedAt < 24 * 60 * 60 * 1000
      ) {
        continue;
      }

      let score = 50;
      const factors: string[] = [];

      // Years in business
      if (company.yearsInBusiness) {
        if (company.yearsInBusiness >= 20) score += 20;
        else if (company.yearsInBusiness >= 10) score += 15;
        else if (company.yearsInBusiness >= 5) score += 10;
        else score += 5;
      }

      // Google rating
      if (company.googleRating) {
        if (company.googleRating >= 4.5) score += 15;
        else if (company.googleRating >= 4.0) score += 10;
        else if (company.googleRating >= 3.5) score += 5;
      }

      // Review count
      if (company.googleReviewCount) {
        if (company.googleReviewCount >= 100) score += 10;
        else if (company.googleReviewCount >= 50) score += 7;
        else if (company.googleReviewCount >= 20) score += 5;
      }

      // Website
      if (company.website) score += 5;

      // Chain
      if (
        company.isChain &&
        company.totalLocations &&
        company.totalLocations > 1
      ) {
        score += 5 + Math.min(5, company.totalLocations);
      }

      score = Math.min(100, score);
      const insights = generateInsights(company, score, factors);

      await ctx.db.patch(company._id, {
        aiScore: score,
        aiInsights: insights,
        updatedAt: Date.now(),
      });

      results.push({ id: company._id, name: company.name, score });
    }

    return { scored: results.length, results };
  },
});

// Get leads sorted by AI score
export const getLeadsByScore = query({
  args: {
    organizationId: v.id("organizations"),
    minScore: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const companies = await ctx.db
      .query("companies")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Filter and sort by AI score
    return companies
      .filter(
        (c) => c.aiScore && (!args.minScore || c.aiScore >= args.minScore),
      )
      .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
      .slice(0, args.limit || 50);
  },
});

// Update outreach strategy for a lead
export const updateOutreachStrategy = mutation({
  args: {
    companyId: v.id("companies"),
    strategy: v.object({
      urgencyLevel: v.union(
        v.literal("high"),
        v.literal("medium"),
        v.literal("low"),
      ),
      primaryAngle: v.object({
        gap: v.string(),
        impact: v.string(),
        openingLine: v.string(),
        estimatedValue: v.optional(v.string()),
        category: v.string(),
      }),
      alternativeAngles: v.array(
        v.object({
          gap: v.string(),
          openingLine: v.string(),
          category: v.string(),
        }),
      ),
      personalizationHooks: v.array(v.string()),
      bestContactMethod: v.union(
        v.literal("email"),
        v.literal("phone"),
        v.literal("linkedin"),
        v.literal("in_person"),
      ),
      doNotContact: v.boolean(),
      doNotContactReason: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.companyId, {
      outreachStrategy: {
        generatedAt: Date.now(),
        ...args.strategy,
      },
      updatedAt: Date.now(),
    });
  },
});

function generateInsights(
  company: any,
  score: number,
  factors: string[],
): string {
  const parts: string[] = [];

  if (score >= 80) {
    parts.push("High-value lead with strong potential.");
  } else if (score >= 60) {
    parts.push("Good prospect with moderate potential.");
  } else {
    parts.push("Lead requires further qualification.");
  }

  if (company.yearsInBusiness && company.yearsInBusiness >= 10) {
    parts.push(
      `Established for ${company.yearsInBusiness} years, indicating stability.`,
    );
  }

  if (company.googleRating && company.googleRating >= 4.0) {
    parts.push(
      `Strong customer satisfaction with ${company.googleRating} star rating.`,
    );
  }

  if (company.googleReviewCount && company.googleReviewCount >= 50) {
    parts.push(
      `Active customer base with ${company.googleReviewCount} reviews.`,
    );
  }

  if (!company.website) {
    parts.push("Missing web presence - opportunity for digital services.");
  }

  return parts.join(" ");
}
