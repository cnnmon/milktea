import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { GenericQueryCtx } from "convex/server";
import { DataModel } from "./_generated/dataModel";

async function getUserEmail(ctx: GenericQueryCtx<DataModel>) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.email;
}

function gracefulRedirect() {
  if (typeof window !== "undefined") {
    window.location.href = "/sign-in";
  }
  return;
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const email = await getUserEmail(ctx);
    if (!email) {
      return gracefulRedirect();
    }

    // query directly with sorting by date desc and email
    const notes = await ctx.db
      .query("notepads")
      .withIndex("by_email_and_date", (q) => q.eq("email", email))
      .order("desc")
      .collect();

    // sort tagged vs untagged notes while maintaining date order
    const sortedNotes = notes.reduce((acc, note) => {
      const dateGroup = acc.find(group => group[0]?.date === note.date);
      if (dateGroup) {
        if (!note.tags) {
          dateGroup.unshift(note); 
        } else {
          dateGroup.push(note); 
        }
      } else {
        acc.push(note.tags ? [note] : [note]);
      }
      return acc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, [] as any[][]).flat();

    return sortedNotes;
  },
});

export const getById = query({
  args: { notepadId: v.id("notepads") },
  handler: async (ctx, args) => {
    if (!args.notepadId) {
      return gracefulRedirect();
    }
    const email = await getUserEmail(ctx);
    if (!email) {
      return gracefulRedirect();
    }
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
    const email = await getUserEmail(ctx);
    if (!email) {
      return null;
    }
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

export const createNotepad = mutation({
  args: { title: v.string(), content: v.string(), tags: v.optional(v.array(v.string())), date: v.string() },
  handler: async (ctx, args) => {
    const email = await getUserEmail(ctx);
    if (!email) {
      return null;
    }
    return await ctx.db.insert("notepads", {
      ...args,
      date: args.date,
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

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const email = await getUserEmail(ctx);
    if (!email) return null;
    return await ctx.db
      .query("notepads")
      .withIndex("by_email_and_date")
      .filter((q) => q.and(q.eq(q.field("email"), email), q.eq(q.field("date"), args.date), q.eq(q.field("tags"), undefined)))
      .first();
  },
});

export const getAllByEmail = query({
  handler: async (ctx) => {
    const email = await getUserEmail(ctx);
    if (!email) return null;
    return await ctx.db
      .query("notepads")
      .withIndex("by_email_and_date")
      .filter((q) => q.eq(q.field("email"), email))
      .order("desc")
      .collect();
  },
});
