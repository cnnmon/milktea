import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Simple password validation for mobile/offline auth
// Password is checked against AUTH_PASSWORD env var in Convex
export const validatePassword = mutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const correctPassword = process.env.AUTH_PASSWORD;

    if (!correctPassword) {
      throw new Error("AUTH_PASSWORD not configured in Convex");
    }

    return args.password === correctPassword;
  },
});
