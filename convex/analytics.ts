import { v } from "convex/values";
import { query } from "./_generated/server";

// Get all organizations (for demo mode)
export const getOrganizations = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("organizations").collect();
  },
});

// Get dashboard stats for the main dashboard page
export const getDashboardStats = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const companies = await ctx.db
      .query("companies")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const totalLeads = companies.length;
    const qualifiedLeads = companies.filter(
      (c) => c.yearsInBusiness && c.yearsInBusiness >= 10,
    ).length;
    const chains = companies.filter((c) => c.isChain).length;

    // Conversion rate from campaigns
    const totalConverted = campaigns.reduce(
      (acc, c) => acc + c.metrics.converted,
      0,
    );
    const totalContacted = campaigns.reduce(
      (acc, c) => acc + c.metrics.contacted,
      0,
    );
    const conversionRate =
      totalContacted > 0 ? (totalConverted / totalContacted) * 100 : 0;

    // Pipeline by status
    const pipelineByStatus: Record<string, number> = {};
    companies.forEach((c) => {
      pipelineByStatus[c.status] = (pipelineByStatus[c.status] || 0) + 1;
    });

    return {
      totalLeads,
      qualifiedLeads,
      chains,
      conversionRate: Math.round(conversionRate * 10) / 10,
      pipelineByStatus,
    };
  },
});

export const getSalesAnalytics = query({
  args: {
    organizationId: v.id("organizations"),
    dateRange: v.object({
      start: v.number(),
      end: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const companies = await ctx.db
      .query("companies")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Calculate metrics
    const totalCompanies = companies.length;
    const qualifiedLeads = companies.filter(
      (c) => c.yearsInBusiness && c.yearsInBusiness >= 10,
    ).length;
    const chainsIdentified = companies.filter((c) => c.isChain).length;

    // Pipeline distribution
    const pipeline = {
      new: companies.filter((c) => c.status === "new").length,
      qualified: companies.filter((c) => c.status === "qualified").length,
      contacted: companies.filter((c) => c.status === "contacted").length,
      preOnboarding: companies.filter((c) => c.status === "pre-onboarding")
        .length,
      onboarding: companies.filter((c) => c.status === "onboarding").length,
      active: companies.filter((c) => c.status === "active").length,
      churned: companies.filter((c) => c.status === "churned").length,
    };

    // Data sources breakdown
    const dataSourcesMap = new Map<string, number>();
    companies.forEach((c) => {
      c.dataSources.forEach((ds) => {
        dataSourcesMap.set(ds.source, (dataSourcesMap.get(ds.source) || 0) + 1);
      });
    });

    const dataSources = Array.from(dataSourcesMap.entries()).map(
      ([name, count]) => ({
        name,
        count,
      }),
    );

    // Conversion rate
    const totalConverted = campaigns.reduce(
      (acc, c) => acc + c.metrics.converted,
      0,
    );
    const totalContacted = campaigns.reduce(
      (acc, c) => acc + c.metrics.contacted,
      0,
    );
    const conversionRate =
      totalContacted > 0 ? (totalConverted / totalContacted) * 100 : 0;

    return {
      totalCompanies,
      qualifiedLeads,
      chainsIdentified,
      conversionRate,
      pipeline,
      dataSources,
    };
  },
});

export const getGrowthMetrics = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;

    const allCompanies = await ctx.db
      .query("companies")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const recentCompanies = allCompanies.filter(
      (c) => c.createdAt >= thirtyDaysAgo,
    );
    const previousCompanies = allCompanies.filter(
      (c) => c.createdAt >= sixtyDaysAgo && c.createdAt < thirtyDaysAgo,
    );

    const growthRate =
      previousCompanies.length > 0
        ? ((recentCompanies.length - previousCompanies.length) /
            previousCompanies.length) *
          100
        : recentCompanies.length > 0
          ? 100
          : 0;

    return {
      totalLeads: allCompanies.length,
      newLeadsThisMonth: recentCompanies.length,
      growthRate: Math.round(growthRate * 10) / 10,
    };
  },
});

export const getCampaignAnalytics = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(
      (c) => c.status === "active",
    ).length;
    const totalLeadsInCampaigns = campaigns.reduce(
      (acc, c) => acc + c.leads.length,
      0,
    );
    const totalRevenue = campaigns.reduce(
      (acc, c) => acc + c.metrics.revenue,
      0,
    );

    const avgResponseRate =
      campaigns.length > 0
        ? campaigns.reduce((acc, c) => {
            const rate =
              c.metrics.contacted > 0
                ? (c.metrics.responded / c.metrics.contacted) * 100
                : 0;
            return acc + rate;
          }, 0) / campaigns.length
        : 0;

    return {
      totalCampaigns,
      activeCampaigns,
      totalLeadsInCampaigns,
      totalRevenue,
      avgResponseRate: Math.round(avgResponseRate * 10) / 10,
    };
  },
});
