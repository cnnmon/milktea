import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
export default defineSchema({
  notepads: defineTable({
    title: v.string(),
    content: v.string(),
    date: v.string(),
    email: v.string(),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_date", ["date"])
    .index("by_email_and_date", ["email", "date", "tags"]),
});
