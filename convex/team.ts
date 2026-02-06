import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// =====================
// ROLE QUERIES
// =====================

export const getRoles = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teamRoles")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

export const getDefaultRole = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teamRoles")
      .withIndex("by_default", (q) =>
        q.eq("organizationId", args.organizationId).eq("isDefault", true),
      )
      .first();
  },
});

// =====================
// ROLE MUTATIONS
// =====================

export const createRole = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.object({
      leads_view: v.boolean(),
      leads_create: v.boolean(),
      leads_edit: v.boolean(),
      leads_delete: v.boolean(),
      leads_export: v.boolean(),
      campaigns_view: v.boolean(),
      campaigns_create: v.boolean(),
      campaigns_edit: v.boolean(),
      campaigns_delete: v.boolean(),
      scraper_run: v.boolean(),
      scraper_configure: v.boolean(),
      analytics_view: v.boolean(),
      analytics_export: v.boolean(),
      integrations_view: v.boolean(),
      integrations_manage: v.boolean(),
      team_view: v.boolean(),
      team_invite: v.boolean(),
      team_manage: v.boolean(),
      billing_view: v.boolean(),
      billing_manage: v.boolean(),
      settings_view: v.boolean(),
      settings_manage: v.boolean(),
      api_access: v.boolean(),
    }),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // If setting as default, unset other default
    if (args.isDefault) {
      const existingDefault = await ctx.db
        .query("teamRoles")
        .withIndex("by_default", (q) =>
          q.eq("organizationId", args.organizationId).eq("isDefault", true),
        )
        .first();

      if (existingDefault) {
        await ctx.db.patch(existingDefault._id, {
          isDefault: false,
          updatedAt: now,
        });
      }
    }

    return await ctx.db.insert("teamRoles", {
      organizationId: args.organizationId,
      name: args.name,
      description: args.description,
      permissions: args.permissions,
      isDefault: args.isDefault ?? false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const initializeDefaultRoles = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const now = Date.now();

    const defaultRoles = [
      {
        name: "Admin",
        description: "Full access to all features",
        isDefault: false,
        permissions: {
          leads_view: true,
          leads_create: true,
          leads_edit: true,
          leads_delete: true,
          leads_export: true,
          campaigns_view: true,
          campaigns_create: true,
          campaigns_edit: true,
          campaigns_delete: true,
          scraper_run: true,
          scraper_configure: true,
          analytics_view: true,
          analytics_export: true,
          integrations_view: true,
          integrations_manage: true,
          team_view: true,
          team_invite: true,
          team_manage: true,
          billing_view: true,
          billing_manage: true,
          settings_view: true,
          settings_manage: true,
          api_access: true,
        },
      },
      {
        name: "Manager",
        description: "Team and campaign management",
        isDefault: false,
        permissions: {
          leads_view: true,
          leads_create: true,
          leads_edit: true,
          leads_delete: false,
          leads_export: true,
          campaigns_view: true,
          campaigns_create: true,
          campaigns_edit: true,
          campaigns_delete: false,
          scraper_run: true,
          scraper_configure: false,
          analytics_view: true,
          analytics_export: true,
          integrations_view: true,
          integrations_manage: false,
          team_view: true,
          team_invite: true,
          team_manage: false,
          billing_view: true,
          billing_manage: false,
          settings_view: true,
          settings_manage: false,
          api_access: false,
        },
      },
      {
        name: "Sales Rep",
        description: "Lead management and outreach",
        isDefault: true,
        permissions: {
          leads_view: true,
          leads_create: true,
          leads_edit: true,
          leads_delete: false,
          leads_export: false,
          campaigns_view: true,
          campaigns_create: false,
          campaigns_edit: false,
          campaigns_delete: false,
          scraper_run: false,
          scraper_configure: false,
          analytics_view: true,
          analytics_export: false,
          integrations_view: false,
          integrations_manage: false,
          team_view: true,
          team_invite: false,
          team_manage: false,
          billing_view: false,
          billing_manage: false,
          settings_view: false,
          settings_manage: false,
          api_access: false,
        },
      },
      {
        name: "Viewer",
        description: "Read-only access",
        isDefault: false,
        permissions: {
          leads_view: true,
          leads_create: false,
          leads_edit: false,
          leads_delete: false,
          leads_export: false,
          campaigns_view: true,
          campaigns_create: false,
          campaigns_edit: false,
          campaigns_delete: false,
          scraper_run: false,
          scraper_configure: false,
          analytics_view: true,
          analytics_export: false,
          integrations_view: false,
          integrations_manage: false,
          team_view: true,
          team_invite: false,
          team_manage: false,
          billing_view: false,
          billing_manage: false,
          settings_view: false,
          settings_manage: false,
          api_access: false,
        },
      },
    ];

    for (const role of defaultRoles) {
      await ctx.db.insert("teamRoles", {
        organizationId: args.organizationId,
        ...role,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// =====================
// TEAM INVITES
// =====================

export const getPendingInvites = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const invites = await ctx.db
      .query("teamInvites")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return invites.filter(
      (invite) => invite.status === "pending" && invite.expiresAt > Date.now(),
    );
  },
});

export const createInvite = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    roleId: v.id("teamRoles"),
    invitedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check for existing pending invite
    const existing = await ctx.db
      .query("teamInvites")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (
      existing &&
      existing.status === "pending" &&
      existing.expiresAt > Date.now()
    ) {
      throw new Error("An invite is already pending for this email");
    }

    // Generate a random token
    const token = Array.from({ length: 32 }, () =>
      Math.random().toString(36).charAt(2),
    ).join("");

    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    return await ctx.db.insert("teamInvites", {
      organizationId: args.organizationId,
      email: args.email,
      roleId: args.roleId,
      invitedBy: args.invitedBy,
      status: "pending",
      token,
      expiresAt,
      createdAt: now,
    });
  },
});

export const acceptInvite = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("teamInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) {
      throw new Error("Invalid invite token");
    }

    if (invite.status !== "pending") {
      throw new Error("This invite has already been used");
    }

    if (invite.expiresAt < Date.now()) {
      throw new Error("This invite has expired");
    }

    // Update invite status
    await ctx.db.patch(invite._id, {
      status: "accepted",
      acceptedAt: Date.now(),
    });

    // Update user's organization
    await ctx.db.patch(args.userId, {
      organizationId: invite.organizationId,
    });

    return { organizationId: invite.organizationId };
  },
});

export const revokeInvite = mutation({
  args: { inviteId: v.id("teamInvites") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.inviteId, { status: "revoked" });
  },
});

// =====================
// AUDIT LOG
// =====================

export const logAction = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    changes: v.optional(
      v.object({
        before: v.optional(v.any()),
        after: v.optional(v.any()),
      }),
    ),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getAuditLogs = query({
  args: {
    organizationId: v.id("organizations"),
    resourceType: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let baseQuery;

    if (args.resourceType) {
      baseQuery = ctx.db
        .query("auditLogs")
        .withIndex("by_resource", (q) =>
          q
            .eq("organizationId", args.organizationId)
            .eq("resourceType", args.resourceType!),
        );
    } else if (args.userId) {
      baseQuery = ctx.db
        .query("auditLogs")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!));
    } else {
      baseQuery = ctx.db
        .query("auditLogs")
        .withIndex("by_org", (q) =>
          q.eq("organizationId", args.organizationId),
        );
    }

    const results = await baseQuery.order("desc").collect();

    if (args.limit) {
      return results.slice(0, args.limit);
    }

    return results;
  },
});
