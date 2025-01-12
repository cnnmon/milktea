import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
export default defineSchema({
  ...authTables,
  messages: defineTable({
    userId: v.id("users"),
    body: v.string(),
  }),
  routines: defineTable({
    title: v.string(),
    tracker: v.optional(
      v.array(
        v.object({
          line: v.string(),
          notepadId: v.string(),
        })
      )
    ),
    type: v.string(),
  }),
  notepads: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
  }),
});