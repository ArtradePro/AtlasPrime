import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// =====================
// SUBSCRIPTION QUERIES
// =====================

export const getSubscription = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .first();
  },
});

export const getUsage = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (!subscription) return null;

    return {
      users: {
        used: subscription.usage.users,
        limit: subscription.features.maxUsers,
        percentage:
          (subscription.usage.users / subscription.features.maxUsers) * 100,
      },
      leads: {
        used: subscription.usage.leads,
        limit: subscription.features.maxLeads,
        percentage:
          (subscription.usage.leads / subscription.features.maxLeads) * 100,
      },
      scrapes: {
        used: subscription.usage.scrapesThisMonth,
        limit: subscription.features.maxScrapesPerMonth,
        percentage:
          (subscription.usage.scrapesThisMonth /
            subscription.features.maxScrapesPerMonth) *
          100,
      },
      emails: {
        used: subscription.usage.emailsThisMonth,
        limit: subscription.features.maxEmailsPerMonth,
        percentage:
          (subscription.usage.emailsThisMonth /
            subscription.features.maxEmailsPerMonth) *
          100,
      },
      aiCredits: {
        used: subscription.usage.aiCreditsUsed,
        limit: subscription.features.aiCreditsPerMonth,
        percentage:
          (subscription.usage.aiCreditsUsed /
            subscription.features.aiCreditsPerMonth) *
          100,
      },
    };
  },
});

// =====================
// SUBSCRIPTION MUTATIONS
// =====================

export const createSubscription = mutation({
  args: {
    organizationId: v.id("organizations"),
    plan: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("enterprise"),
    ),
  },
  handler: async (ctx, args) => {
    const planFeatures = {
      free: {
        maxUsers: 1,
        maxLeads: 100,
        maxScrapesPerMonth: 50,
        maxEmailsPerMonth: 100,
        aiCreditsPerMonth: 10,
        customBranding: false,
        apiAccess: false,
        prioritySupport: false,
        dedicatedSuccess: false,
      },
      starter: {
        maxUsers: 3,
        maxLeads: 1000,
        maxScrapesPerMonth: 500,
        maxEmailsPerMonth: 1000,
        aiCreditsPerMonth: 100,
        customBranding: false,
        apiAccess: false,
        prioritySupport: false,
        dedicatedSuccess: false,
      },
      pro: {
        maxUsers: 10,
        maxLeads: 10000,
        maxScrapesPerMonth: 5000,
        maxEmailsPerMonth: 10000,
        aiCreditsPerMonth: 500,
        customBranding: true,
        apiAccess: true,
        prioritySupport: true,
        dedicatedSuccess: false,
      },
      enterprise: {
        maxUsers: -1, // Unlimited
        maxLeads: -1,
        maxScrapesPerMonth: -1,
        maxEmailsPerMonth: -1,
        aiCreditsPerMonth: -1,
        customBranding: true,
        apiAccess: true,
        prioritySupport: true,
        dedicatedSuccess: true,
      },
    };

    const now = Date.now();
    const periodEnd = now + 30 * 24 * 60 * 60 * 1000; // 30 days

    return await ctx.db.insert("subscriptions", {
      organizationId: args.organizationId,
      plan: args.plan,
      status: args.plan === "free" ? "active" : "trialing",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      features: planFeatures[args.plan],
      usage: {
        users: 0,
        leads: 0,
        scrapesThisMonth: 0,
        emailsThisMonth: 0,
        aiCreditsUsed: 0,
      },
      trialEndsAt: args.plan !== "free" ? periodEnd : undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const incrementUsage = mutation({
  args: {
    organizationId: v.id("organizations"),
    type: v.union(
      v.literal("leads"),
      v.literal("scrapes"),
      v.literal("emails"),
      v.literal("aiCredits"),
    ),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (!subscription) throw new Error("No subscription found");

    const usageField = {
      leads: "leads",
      scrapes: "scrapesThisMonth",
      emails: "emailsThisMonth",
      aiCredits: "aiCreditsUsed",
    }[args.type] as keyof typeof subscription.usage;

    const newUsage = { ...subscription.usage };
    (newUsage as any)[usageField] += args.amount;

    await ctx.db.patch(subscription._id, {
      usage: newUsage,
      updatedAt: Date.now(),
    });
  },
});

// =====================
// CREDIT TRANSACTIONS
// =====================

export const getCreditBalance = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const lastTransaction = await ctx.db
      .query("creditTransactions")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .first();

    return lastTransaction?.balance ?? 0;
  },
});

export const getCreditHistory = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("creditTransactions")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .collect();

    if (args.limit) {
      return results.slice(0, args.limit);
    }

    return results;
  },
});

export const addCredits = mutation({
  args: {
    organizationId: v.id("organizations"),
    amount: v.number(),
    type: v.union(
      v.literal("purchase"),
      v.literal("bonus"),
      v.literal("refund"),
    ),
    description: v.string(),
    stripePaymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentBalance = await ctx.db
      .query("creditTransactions")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .first()
      .then((t) => t?.balance ?? 0);

    return await ctx.db.insert("creditTransactions", {
      organizationId: args.organizationId,
      type: args.type,
      amount: args.amount,
      balance: currentBalance + args.amount,
      description: args.description,
      metadata: args.stripePaymentId
        ? { stripePaymentId: args.stripePaymentId }
        : undefined,
      createdAt: Date.now(),
    });
  },
});

export const useCredits = mutation({
  args: {
    organizationId: v.id("organizations"),
    amount: v.number(),
    feature: v.string(),
    companyId: v.optional(v.id("companies")),
  },
  handler: async (ctx, args) => {
    const currentBalance = await ctx.db
      .query("creditTransactions")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .first()
      .then((t) => t?.balance ?? 0);

    if (currentBalance < args.amount) {
      throw new Error("Insufficient credits");
    }

    return await ctx.db.insert("creditTransactions", {
      organizationId: args.organizationId,
      type: "usage",
      amount: -args.amount,
      balance: currentBalance - args.amount,
      description: `Used for ${args.feature}`,
      metadata: {
        feature: args.feature,
        companyId: args.companyId,
      },
      createdAt: Date.now(),
    });
  },
});

// =====================
// INVOICES
// =====================

export const getInvoices = query({
  args: {
    organizationId: v.id("organizations"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("open"),
        v.literal("paid"),
        v.literal("void"),
        v.literal("uncollectible"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("invoices")
        .withIndex("by_status", (q) =>
          q
            .eq("organizationId", args.organizationId)
            .eq("status", args.status!),
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .collect();
  },
});
