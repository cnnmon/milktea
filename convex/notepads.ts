import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const tokenIdentifier = identity.tokenIdentifier;
    return await ctx.db
      .query("notepads")
      .filter((q) => q.eq(q.field("userId"), "jx76xg2by0k0rm8y090npr2nbn784vrw" as Id<"users">))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { notepadId: v.id("notepads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.notepadId);
  },
});

export const update = mutation({
  args: { notepadId: v.id("notepads"), title: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.notepadId, {
      title: args.title,
      content: args.content,
    });
  },
});

export const create = mutation({
  args: { title: v.string(), content: v.string(), tags: v.array(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notepads", {
      ...args,
      userId: "lol" as Id<"users">,
      createdAt: Date.now(),
    });
  },
});
