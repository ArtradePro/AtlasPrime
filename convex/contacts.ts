import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getContacts = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("contacts")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();
  },
});

export const addContacts = mutation({
  args: {
    companyId: v.id("companies"),
    organizationId: v.id("organizations"),
    contacts: v.array(
      v.object({
        firstName: v.string(),
        lastName: v.string(),
        title: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        linkedinUrl: v.optional(v.string()),
        seniority: v.optional(
          v.union(
            v.literal("c-level"),
            v.literal("vp"),
            v.literal("director"),
            v.literal("manager"),
            v.literal("staff")
          )
        ),
        dataSource: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const contactIds = [];

    for (const contact of args.contacts) {
      const emails = contact.email
        ? [
            {
              email: contact.email,
              type: "primary" as const,
              verified: false,
              source: contact.dataSource,
            },
          ]
        : [];

      const phones = contact.phone
        ? [
            {
              phone: contact.phone,
              type: "work" as const,
              source: contact.dataSource,
            },
          ]
        : [];

      const contactId = await ctx.db.insert("contacts", {
        organizationId: args.organizationId,
        companyId: args.companyId,
        firstName: contact.firstName,
        lastName: contact.lastName,
        fullName: `${contact.firstName} ${contact.lastName}`,
        title: contact.title,
        seniority: contact.seniority,
        emails,
        phones,
        linkedinUrl: contact.linkedinUrl,
        contactAttempts: 0,
        dataSource: contact.dataSource,
        confidence: 80,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      contactIds.push(contactId);
    }

    return contactIds;
  },
});

export const updateContactEmail = mutation({
  args: {
    contactId: v.id("contacts"),
    email: v.string(),
    verified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.contactId);
    if (!contact) throw new Error("Contact not found");

    const existingEmailIndex = contact.emails.findIndex((e) => e.email === args.email);

    let updatedEmails;
    if (existingEmailIndex >= 0) {
      updatedEmails = [...contact.emails];
      updatedEmails[existingEmailIndex] = {
        ...updatedEmails[existingEmailIndex],
        verified: args.verified,
        verifiedAt: args.verified ? Date.now() : undefined,
      };
    } else {
      updatedEmails = [
        ...contact.emails,
        {
          email: args.email,
          type: "secondary" as const,
          verified: args.verified,
          verifiedAt: args.verified ? Date.now() : undefined,
          source: "manual",
        },
      ];
    }

    await ctx.db.patch(args.contactId, {
      emails: updatedEmails,
      updatedAt: Date.now(),
    });
  },
});
