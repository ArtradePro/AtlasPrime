import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Email Sequence Templates
export const getSequences = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("emailSequences")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

export const getSequenceById = query({
  args: { id: v.id("emailSequences") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const createSequence = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    steps: v.array(
      v.object({
        order: v.number(),
        type: v.union(
          v.literal("email"),
          v.literal("wait"),
          v.literal("condition"),
        ),
        delayDays: v.optional(v.number()),
        subject: v.optional(v.string()),
        body: v.optional(v.string()),
        useAiPersonalization: v.boolean(),
        condition: v.optional(
          v.object({
            field: v.string(),
            operator: v.string(),
            value: v.string(),
          }),
        ),
      }),
    ),
    targetCriteria: v.optional(
      v.object({
        industries: v.optional(v.array(v.string())),
        minYearsInBusiness: v.optional(v.number()),
        isChain: v.optional(v.boolean()),
        statuses: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const sequenceId = await ctx.db.insert("emailSequences", {
      organizationId: args.organizationId,
      name: args.name,
      description: args.description,
      steps: args.steps,
      targetCriteria: args.targetCriteria,
      status: "draft",
      metrics: {
        enrolled: 0,
        completed: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return sequenceId;
  },
});

export const updateSequenceStatus = mutation({
  args: {
    id: v.id("emailSequences"),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const enrollLeadInSequence = mutation({
  args: {
    sequenceId: v.id("emailSequences"),
    companyId: v.id("companies"),
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    // Create enrollment record
    const enrollmentId = await ctx.db.insert("sequenceEnrollments", {
      sequenceId: args.sequenceId,
      companyId: args.companyId,
      contactId: args.contactId,
      currentStep: 0,
      status: "active",
      enrolledAt: Date.now(),
      nextActionAt: Date.now(),
      history: [],
    });

    // Update sequence metrics
    const sequence = await ctx.db.get(args.sequenceId);
    if (sequence) {
      await ctx.db.patch(args.sequenceId, {
        metrics: {
          ...sequence.metrics,
          enrolled: sequence.metrics.enrolled + 1,
        },
      });
    }

    return enrollmentId;
  },
});

export const getEnrollments = query({
  args: {
    sequenceId: v.id("emailSequences"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("sequenceEnrollments")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
      .collect();
  },
});

export const recordEmailEvent = mutation({
  args: {
    enrollmentId: v.id("sequenceEnrollments"),
    eventType: v.union(
      v.literal("sent"),
      v.literal("opened"),
      v.literal("clicked"),
      v.literal("replied"),
      v.literal("bounced"),
      v.literal("unsubscribed"),
    ),
    stepIndex: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) return;

    const historyEntry = {
      eventType: args.eventType,
      stepIndex: args.stepIndex,
      timestamp: Date.now(),
      metadata: args.metadata,
    };

    await ctx.db.patch(args.enrollmentId, {
      history: [...enrollment.history, historyEntry],
    });

    // Update sequence metrics based on event type
    const sequence = await ctx.db.get(enrollment.sequenceId);
    if (sequence) {
      const metricsUpdate = { ...sequence.metrics };
      if (args.eventType === "replied") metricsUpdate.replied += 1;
      if (args.eventType === "bounced") metricsUpdate.bounced += 1;
      if (args.eventType === "unsubscribed") metricsUpdate.unsubscribed += 1;

      await ctx.db.patch(enrollment.sequenceId, { metrics: metricsUpdate });
    }
  },
});

// Get sequence templates
export const getTemplates = query({
  args: {},
  handler: async () => {
    return [
      {
        id: "welcome",
        name: "New Lead Welcome Sequence",
        description: "Initial outreach for new leads with 3-email cadence",
        steps: [
          {
            order: 1,
            type: "email",
            subject: "Introduction - {CompanyName}",
            delayDays: 0,
            useAiPersonalization: true,
          },
          { order: 2, type: "wait", delayDays: 3, useAiPersonalization: false },
          {
            order: 3,
            type: "email",
            subject: "Quick follow-up",
            delayDays: 0,
            useAiPersonalization: true,
          },
          { order: 4, type: "wait", delayDays: 5, useAiPersonalization: false },
          {
            order: 5,
            type: "email",
            subject: "One more thing...",
            delayDays: 0,
            useAiPersonalization: true,
          },
        ],
      },
      {
        id: "reengagement",
        name: "Re-engagement Campaign",
        description: "Win back cold leads who haven't responded",
        steps: [
          {
            order: 1,
            type: "email",
            subject: "It's been a while...",
            delayDays: 0,
            useAiPersonalization: true,
          },
          { order: 2, type: "wait", delayDays: 7, useAiPersonalization: false },
          {
            order: 3,
            type: "email",
            subject: "Special offer for you",
            delayDays: 0,
            useAiPersonalization: true,
          },
        ],
      },
      {
        id: "high-value",
        name: "High-Value Lead Nurture",
        description: "Premium sequence for high-scoring leads",
        steps: [
          {
            order: 1,
            type: "email",
            subject: "Personalized introduction",
            delayDays: 0,
            useAiPersonalization: true,
          },
          { order: 2, type: "wait", delayDays: 2, useAiPersonalization: false },
          {
            order: 3,
            type: "email",
            subject: "Case study relevant to your industry",
            delayDays: 0,
            useAiPersonalization: true,
          },
          { order: 4, type: "wait", delayDays: 3, useAiPersonalization: false },
          {
            order: 5,
            type: "email",
            subject: "Let's schedule a call",
            delayDays: 0,
            useAiPersonalization: true,
          },
          { order: 6, type: "wait", delayDays: 4, useAiPersonalization: false },
          {
            order: 7,
            type: "email",
            subject: "Final follow-up",
            delayDays: 0,
            useAiPersonalization: true,
          },
        ],
      },
    ];
  },
});

// Bulk enroll leads matching criteria
export const bulkEnrollLeads = mutation({
  args: {
    sequenceId: v.id("emailSequences"),
    organizationId: v.id("organizations"),
    filters: v.optional(
      v.object({
        status: v.optional(v.string()),
        industry: v.optional(v.string()),
        minAiScore: v.optional(v.number()),
      }),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sequence = await ctx.db.get(args.sequenceId);
    if (!sequence) throw new Error("Sequence not found");

    let companies = await ctx.db
      .query("companies")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    if (args.filters) {
      if (args.filters.status) {
        companies = companies.filter((c) => c.status === args.filters!.status);
      }
      if (args.filters.industry) {
        companies = companies.filter(
          (c) => c.industry === args.filters!.industry,
        );
      }
      if (args.filters.minAiScore) {
        companies = companies.filter(
          (c) => (c.aiScore || 0) >= args.filters!.minAiScore!,
        );
      }
    }

    companies = companies.slice(0, args.limit || 50);

    let enrolled = 0;

    for (const company of companies) {
      const contact = await ctx.db
        .query("contacts")
        .withIndex("by_company", (q) => q.eq("companyId", company._id))
        .first();

      if (!contact) continue;

      const existing = await ctx.db
        .query("sequenceEnrollments")
        .withIndex("by_company", (q) => q.eq("companyId", company._id))
        .filter((q) => q.eq(q.field("sequenceId"), args.sequenceId))
        .first();

      if (existing) continue;

      await ctx.db.insert("sequenceEnrollments", {
        sequenceId: args.sequenceId,
        companyId: company._id,
        contactId: contact._id,
        currentStep: 0,
        status: "active",
        enrolledAt: Date.now(),
        nextActionAt: Date.now(),
        history: [
          {
            eventType: "enrolled",
            stepIndex: 0,
            timestamp: Date.now(),
          },
        ],
      });

      enrolled++;
    }

    await ctx.db.patch(args.sequenceId, {
      metrics: {
        ...sequence.metrics,
        enrolled: sequence.metrics.enrolled + enrolled,
      },
      updatedAt: Date.now(),
    });

    return { enrolled };
  },
});

// Delete sequence
export const deleteSequence = mutation({
  args: { id: v.id("emailSequences") },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("sequenceEnrollments")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", args.id))
      .collect();

    for (const enrollment of enrollments) {
      await ctx.db.delete(enrollment._id);
    }

    await ctx.db.delete(args.id);
  },
});
