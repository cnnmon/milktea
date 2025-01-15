import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { GenericQueryCtx } from "convex/server";
import { DataModel } from "./_generated/dataModel";

async function getUserEmailBang(ctx: GenericQueryCtx<DataModel>) {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.email;
}

function gracefulRedirect() {
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
  return;
}

export const get = query({
  handler: async (ctx) => {
    const email = await getUserEmailBang(ctx);
    return await ctx.db
      .query("notepads")
      .withIndex("by_user", (q) => q.eq("email", email))
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
    const email = await getUserEmailBang(ctx);
    const notepad = await ctx.db.get(args.notepadId);
    if (notepad?.email !== email) {
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
  args: { title: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    const email = await getUserEmailBang(ctx);
    return await ctx.db.insert("notepads", {
      ...args,
      date: new Date().toISOString(),
      email: email,
    });
  },
});

export const deleteNotepad = mutation({
  args: { notepadId: v.id("notepads") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.notepadId);
  },
});
