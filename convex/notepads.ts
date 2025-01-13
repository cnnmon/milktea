import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

function gracefulRedirect() {
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
  return;
}

export const get = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return gracefulRedirect();
    }
    return await ctx.db
      .query("notepads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { notepadId: v.id("notepads") },
  handler: async (ctx, args) => {
    if (!args.notepadId) {
      return gracefulRedirect();
    }
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return gracefulRedirect();
    }
    const notepad = await ctx.db.get(args.notepadId);
    if (notepad?.userId !== userId) {
      return gracefulRedirect();
    }
    return notepad;
  },
});

export const updateTitle = mutation({
  args: { notepadId: v.id("notepads"), title: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.notepadId, {
      title: args.title,
    });
  },
});

export const updateContent = mutation({
  args: { notepadId: v.id("notepads"), content: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.notepadId, {
      content: args.content,
    });
  },
});

export const create = mutation({
  args: { title: v.string(), content: v.string(), tags: v.array(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return gracefulRedirect();
    }
    return await ctx.db.insert("notepads", {
      ...args,
      date: new Date().toISOString(),
      userId: userId,
    });
  },
});

export const deleteNotepad = mutation({
  args: { notepadId: v.id("notepads") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.notepadId);
  },
});

export const updateTags = mutation({
  args: { notepadId: v.id("notepads"), tags: v.array(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    
    await ctx.db.patch(args.notepadId, {
      tags: args.tags,
    });
  },
});
