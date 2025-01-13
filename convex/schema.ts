import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
export default defineSchema({
  ...authTables,
  notepads: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    date: v.string(),
    userId: v.optional(v.id("users")),
  })
    .searchIndex("search_notepads", { searchField: "title" })
    .index("by_user", ["userId"]),
});
