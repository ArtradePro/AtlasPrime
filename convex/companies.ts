import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCompanies = query({
  args: {
    organizationId: v.id("organizations"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("companies")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId));

    if (args.status) {
      q = ctx.db
        .query("companies")
        .withIndex("by_status", (q) =>
          q
            .eq("organizationId", args.organizationId)
            .eq("status", args.status as any),
        );
    }

    return q.order("desc").take(args.limit || 50);
  },
});

export const getCompanyById = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const createCompany = mutation({
  args: {
    organizationId: v.id("organizations"),
    data: v.object({
      name: v.string(),
      industry: v.string(),
      description: v.optional(v.string()),
      primaryAddress: v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        country: v.string(),
        zipCode: v.string(),
        coordinates: v.optional(
          v.object({
            lat: v.number(),
            lng: v.number(),
          }),
        ),
      }),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
      foundedYear: v.optional(v.number()),
      googleRating: v.optional(v.number()),
      googleReviewCount: v.optional(v.number()),
      dataSource: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const currentYear = new Date().getFullYear();
    const yearsInBusiness = args.data.foundedYear
      ? currentYear - args.data.foundedYear
      : undefined;

    const companyId = await ctx.db.insert("companies", {
      organizationId: args.organizationId,
      name: args.data.name,
      industry: args.data.industry,
      description: args.data.description,
      primaryAddress: args.data.primaryAddress,
      additionalLocations: [],
      isChain: false,
      totalLocations: 1,
      foundedYear: args.data.foundedYear,
      yearsInBusiness,
      phone: args.data.phone,
      website: args.data.website,
      socialProfiles: {},
      googleRating: args.data.googleRating,
      googleReviewCount: args.data.googleReviewCount,
      dataSources: args.data.dataSource
        ? [
            {
              source: args.data.dataSource,
              scrapedAt: Date.now(),
              dataPoints: [],
            },
          ]
        : [],
      status: "new",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return companyId;
  },
});

export const updateCompanyStatus = mutation({
  args: {
    id: v.id("companies"),
    status: v.union(
      v.literal("new"),
      v.literal("qualified"),
      v.literal("contacted"),
      v.literal("pre-onboarding"),
      v.literal("onboarding"),
      v.literal("active"),
      v.literal("churned"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const getRecentLeads = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("companies")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(args.limit || 10);
  },
});

export const searchCompanies = query({
  args: {
    organizationId: v.id("organizations"),
    searchQuery: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("companies")
      .withSearchIndex("search_companies", (q) =>
        q
          .search("name", args.searchQuery)
          .eq("organizationId", args.organizationId),
      )
      .take(20);
  },
});

// Simplified create mutation for webhook use
export const create = mutation({
  args: {
    name: v.string(),
    industry: v.string(),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    source: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const companyId = await ctx.db.insert("companies", {
      organizationId: args.organizationId,
      name: args.name,
      industry: args.industry,
      description: undefined,
      primaryAddress: {
        street: args.address || "",
        city: args.city || "",
        state: args.state || "",
        country: args.country || "USA",
        zipCode: "",
      },
      additionalLocations: [],
      isChain: false,
      totalLocations: 1,
      phone: args.phone,
      website: args.website,
      socialProfiles: {},
      dataSources: args.source
        ? [
            {
              source: args.source,
              scrapedAt: Date.now(),
              dataPoints: [args.sourceUrl || ""],
            },
          ]
        : [],
      status: "new",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return companyId;
  },
});

// Create from webhook - accepts organizationId as string and looks it up
export const createFromWebhook = mutation({
  args: {
    name: v.string(),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    source: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the first organization (demo mode)
    const orgs = await ctx.db.query("organizations").collect();
    if (orgs.length === 0) {
      throw new Error("No organization found");
    }
    const organizationId = orgs[0]._id;

    const companyId = await ctx.db.insert("companies", {
      organizationId,
      name: args.name,
      industry: args.industry || args.category || "Unknown",
      description: undefined,
      primaryAddress: {
        street: args.address || "",
        city: args.city || "",
        state: args.state || "",
        country: args.country || "USA",
        zipCode: "",
      },
      additionalLocations: [],
      isChain: false,
      totalLocations: 1,
      phone: args.phone,
      website: args.website,
      socialProfiles: {},
      googleRating: args.rating,
      googleReviewCount: args.reviewCount,
      dataSources: args.source
        ? [
            {
              source: args.source,
              scrapedAt: Date.now(),
              dataPoints: [args.sourceUrl || ""],
            },
          ]
        : [],
      status: "new",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return companyId;
  },
});
