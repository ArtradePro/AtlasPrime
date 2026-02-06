import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCampaigns = query({
  args: {
    organizationId: v.id("organizations"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return ctx.db
        .query("campaigns")
        .withIndex("by_status", (q) =>
          q.eq("organizationId", args.organizationId).eq("status", args.status as any)
        )
        .collect();
    }

    return ctx.db
      .query("campaigns")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .collect();
  },
});

export const createCampaign = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("email"),
      v.literal("linkedin"),
      v.literal("multi-channel")
    ),
    targetCriteria: v.object({
      industries: v.array(v.string()),
      locations: v.array(v.string()),
      minYearsInBusiness: v.optional(v.number()),
      minEmployees: v.optional(v.number()),
      isChain: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const campaignId = await ctx.db.insert("campaigns", {
      organizationId: args.organizationId,
      name: args.name,
      description: args.description,
      type: args.type,
      targetCriteria: args.targetCriteria,
      leads: [],
      status: "draft",
      metrics: {
        totalLeads: 0,
        contacted: 0,
        responded: 0,
        converted: 0,
        revenue: 0,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return campaignId;
  },
});

export const updateCampaignStatus = mutation({
  args: {
    id: v.id("campaigns"),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const addLeadsToCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    leadIds: v.array(v.id("companies")),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");

    const existingLeads = new Set(campaign.leads);
    const newLeads = args.leadIds.filter((id) => !existingLeads.has(id));

    await ctx.db.patch(args.campaignId, {
      leads: [...campaign.leads, ...newLeads],
      metrics: {
        ...campaign.metrics,
        totalLeads: campaign.leads.length + newLeads.length,
      },
      updatedAt: Date.now(),
    });
  },
});

export const updateCampaignMetrics = mutation({
  args: {
    campaignId: v.id("campaigns"),
    metrics: v.object({
      totalLeads: v.optional(v.number()),
      contacted: v.optional(v.number()),
      responded: v.optional(v.number()),
      converted: v.optional(v.number()),
      revenue: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");

    await ctx.db.patch(args.campaignId, {
      metrics: {
        ...campaign.metrics,
        ...args.metrics,
      },
      updatedAt: Date.now(),
    });
  },
});
