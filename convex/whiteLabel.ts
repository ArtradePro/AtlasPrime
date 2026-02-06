import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// =====================
// WHITE-LABEL QUERIES
// =====================

export const getWhiteLabelSettings = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("whiteLabelSettings")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .first();
  },
});

// =====================
// WHITE-LABEL MUTATIONS
// =====================

export const updateWhiteLabelSettings = mutation({
  args: {
    organizationId: v.id("organizations"),
    enabled: v.boolean(),
    branding: v.object({
      companyName: v.string(),
      logoUrl: v.optional(v.string()),
      faviconUrl: v.optional(v.string()),
      primaryColor: v.string(),
      secondaryColor: v.string(),
      accentColor: v.string(),
      darkMode: v.boolean(),
    }),
    hidePoweredBy: v.boolean(),
    customTermsUrl: v.optional(v.string()),
    customPrivacyUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("whiteLabelSettings")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .first();

    const now = Date.now();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        enabled: args.enabled,
        branding: args.branding,
        hidePoweredBy: args.hidePoweredBy,
        customTermsUrl: args.customTermsUrl,
        customPrivacyUrl: args.customPrivacyUrl,
        updatedAt: now,
      });
    }

    return await ctx.db.insert("whiteLabelSettings", {
      organizationId: args.organizationId,
      enabled: args.enabled,
      branding: args.branding,
      hidePoweredBy: args.hidePoweredBy,
      customTermsUrl: args.customTermsUrl,
      customPrivacyUrl: args.customPrivacyUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const setupCustomDomain = mutation({
  args: {
    organizationId: v.id("organizations"),
    customDomain: v.string(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("whiteLabelSettings")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (!settings) {
      throw new Error("White-label settings not found");
    }

    // Generate DNS records for verification
    const dnsRecords = [
      {
        type: "CNAME",
        name: args.customDomain,
        value: "app.atlasprime.com",
        verified: false,
      },
      {
        type: "TXT",
        name: `_atlasprime.${args.customDomain}`,
        value: `atlasprime-verify=${args.organizationId}`,
        verified: false,
      },
    ];

    return await ctx.db.patch(settings._id, {
      domain: {
        customDomain: args.customDomain,
        verified: false,
        sslEnabled: false,
        dnsRecords,
      },
      updatedAt: Date.now(),
    });
  },
});

export const verifyDomain = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("whiteLabelSettings")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (!settings || !settings.domain) {
      throw new Error("No custom domain configured");
    }

    // In production, this would verify DNS records
    // For now, we'll simulate verification
    const verifiedRecords = settings.domain.dnsRecords.map((record) => ({
      ...record,
      verified: true, // Would be actual DNS lookup in production
    }));

    const allVerified = verifiedRecords.every((r) => r.verified);

    return await ctx.db.patch(settings._id, {
      domain: {
        ...settings.domain,
        verified: allVerified,
        sslEnabled: allVerified,
        dnsRecords: verifiedRecords,
      },
      updatedAt: Date.now(),
    });
  },
});

export const updateEmailSettings = mutation({
  args: {
    organizationId: v.id("organizations"),
    emailSettings: v.object({
      fromName: v.string(),
      fromEmail: v.string(),
      replyTo: v.string(),
      customDomain: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("whiteLabelSettings")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (!settings) {
      throw new Error("White-label settings not found");
    }

    return await ctx.db.patch(settings._id, {
      emailSettings: args.emailSettings,
      updatedAt: Date.now(),
    });
  },
});

// =====================
// API KEYS
// =====================

export const getApiKeys = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("apiKeys")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

export const createApiKey = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    name: v.string(),
    permissions: v.array(v.string()),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Generate API key (in production, use crypto.randomBytes)
    const keyChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const key = `ap_${Array.from({ length: 40 }, () =>
      keyChars.charAt(Math.floor(Math.random() * keyChars.length)),
    ).join("")}`;

    const keyPrefix = key.substring(0, 10);

    // In production, hash the key
    const keyHash = key; // Would be hashed with bcrypt/argon2 in production

    const now = Date.now();
    const expiresAt = args.expiresInDays
      ? now + args.expiresInDays * 24 * 60 * 60 * 1000
      : undefined;

    await ctx.db.insert("apiKeys", {
      organizationId: args.organizationId,
      userId: args.userId,
      name: args.name,
      keyPrefix,
      keyHash,
      permissions: args.permissions,
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 10000,
      },
      expiresAt,
      isActive: true,
      createdAt: now,
    });

    // Return the full key only once (will never be shown again)
    return { key, keyPrefix };
  },
});

export const revokeApiKey = mutation({
  args: { apiKeyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.apiKeyId, { isActive: false });
  },
});

export const updateApiKeyRateLimit = mutation({
  args: {
    apiKeyId: v.id("apiKeys"),
    requestsPerMinute: v.number(),
    requestsPerDay: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.apiKeyId, {
      rateLimit: {
        requestsPerMinute: args.requestsPerMinute,
        requestsPerDay: args.requestsPerDay,
      },
    });
  },
});

// =====================
// API USAGE TRACKING
// =====================

export const getApiUsage = query({
  args: {
    organizationId: v.id("organizations"),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("apiUsage")
      .withIndex("by_timestamp", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.startTime),
          q.lte(q.field("timestamp"), args.endTime),
        ),
      )
      .collect();

    // Aggregate by endpoint
    const byEndpoint = usage.reduce(
      (acc, u) => {
        if (!acc[u.endpoint]) {
          acc[u.endpoint] = { count: 0, totalCredits: 0, avgResponseTime: 0 };
        }
        acc[u.endpoint].count++;
        acc[u.endpoint].totalCredits += u.creditsUsed;
        acc[u.endpoint].avgResponseTime =
          (acc[u.endpoint].avgResponseTime * (acc[u.endpoint].count - 1) +
            u.responseTime) /
          acc[u.endpoint].count;
        return acc;
      },
      {} as Record<
        string,
        { count: number; totalCredits: number; avgResponseTime: number }
      >,
    );

    return {
      totalRequests: usage.length,
      totalCreditsUsed: usage.reduce((sum, u) => sum + u.creditsUsed, 0),
      byEndpoint,
      errorRate:
        (usage.filter((u) => u.statusCode >= 400).length / usage.length) *
          100 || 0,
    };
  },
});

export const logApiRequest = mutation({
  args: {
    organizationId: v.id("organizations"),
    apiKeyId: v.id("apiKeys"),
    endpoint: v.string(),
    method: v.string(),
    statusCode: v.number(),
    responseTime: v.number(),
    creditsUsed: v.number(),
    requestIp: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Update last used timestamp on API key
    await ctx.db.patch(args.apiKeyId, { lastUsedAt: Date.now() });

    return await ctx.db.insert("apiUsage", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// =====================
// AVAILABLE API SCOPES
// =====================

export const getAvailableScopes = query({
  handler: async () => {
    return [
      { scope: "leads:read", description: "Read lead data" },
      { scope: "leads:write", description: "Create and update leads" },
      { scope: "leads:delete", description: "Delete leads" },
      { scope: "contacts:read", description: "Read contact data" },
      { scope: "contacts:write", description: "Create and update contacts" },
      { scope: "campaigns:read", description: "Read campaign data" },
      { scope: "campaigns:write", description: "Create and manage campaigns" },
      { scope: "scraper:run", description: "Run scraper jobs" },
      { scope: "analytics:read", description: "Read analytics data" },
      { scope: "ai:analyze", description: "Use AI analysis features" },
      { scope: "webhooks:manage", description: "Manage webhooks" },
    ];
  },
});
