import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

export const createScraperJob = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    type: v.union(
      v.literal("google_maps"),
      v.literal("linkedin"),
      v.literal("email_finder"),
      v.literal("enrichment"),
      v.literal("ad_intelligence"),
    ),
    config: v.object({
      query: v.optional(v.string()),
      location: v.optional(v.string()),
      radius: v.optional(v.number()),
      filters: v.optional(
        v.object({
          minYearsInBusiness: v.optional(v.number()),
          industries: v.optional(v.array(v.string())),
          minEmployees: v.optional(v.number()),
          hasWebsite: v.optional(v.boolean()),
        }),
      ),
      maxResults: v.optional(v.number()),
      targetCompanyIds: v.optional(v.array(v.id("companies"))),
    }),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("scraperJobs", {
      organizationId: args.organizationId,
      userId: args.userId,
      type: args.type,
      config: args.config,
      status: "pending",
      progress: {
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
      },
      createdAt: Date.now(),
    });

    return jobId;
  },
});

export const updateJobProgress = internalMutation({
  args: {
    jobId: v.id("scraperJobs"),
    progress: v.object({
      total: v.number(),
      processed: v.number(),
      succeeded: v.number(),
      failed: v.number(),
    }),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled"),
      ),
    ),
    results: v.optional(
      v.object({
        companiesFound: v.number(),
        contactsFound: v.number(),
        emailsFound: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {
      progress: args.progress,
    };

    if (args.status) {
      updates.status = args.status;
      if (args.status === "running") {
        updates.startedAt = Date.now();
      }
      if (args.status === "completed" || args.status === "failed") {
        updates.completedAt = Date.now();
      }
    }

    if (args.results) {
      updates.results = args.results;
    }

    await ctx.db.patch(args.jobId, updates);
  },
});

export const getActiveJobs = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("scraperJobs")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "running"),
        ),
      )
      .collect();
  },
});

export const getJobHistory = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("scraperJobs")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(args.limit || 50);
  },
});

export const cancelJob = mutation({
  args: {
    jobId: v.id("scraperJobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (job && (job.status === "pending" || job.status === "running")) {
      await ctx.db.patch(args.jobId, {
        status: "cancelled",
        completedAt: Date.now(),
      });
    }
  },
});

// Public mutation for webhook updates
export const updateJob = mutation({
  args: {
    id: v.id("scraperJobs"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled"),
      ),
    ),
    progress: v.optional(v.number()),
    resultsCount: v.optional(v.number()),
    error: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {};

    if (args.status) updates.status = args.status;
    if (args.progress !== undefined) {
      updates.progress = {
        total: 100,
        processed: args.progress,
        succeeded: args.progress,
        failed: 0,
      };
    }
    if (args.resultsCount !== undefined) {
      updates.results = {
        companiesFound: args.resultsCount,
        contactsFound: 0,
        emailsFound: 0,
      };
    }
    if (args.error) updates.error = args.error;
    if (args.completedAt) updates.completedAt = args.completedAt;

    await ctx.db.patch(args.id, updates);
  },
});
