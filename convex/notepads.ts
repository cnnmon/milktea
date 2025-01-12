import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("notepads")
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { notepadId: v.id("notepads") },
  handler: async (ctx, args) => {
    const notepad = await ctx.db.get(args.notepadId);
    return notepad;
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
      date: new Date().toISOString(),
    });
  },
});

export const deleteNotepad = mutation({
  args: { notepadId: v.id("notepads") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.notepadId);
  },
});
