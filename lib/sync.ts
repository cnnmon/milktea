import { db, LocalNotepad } from "./db";
import { ConvexReactClient } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
  errors: string[];
}

export async function syncAll(convex: ConvexReactClient): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0, conflicts: 0, errors: [] };

  try {
    // 1. Push pending local changes to Convex
    const pending = await db.notepads
      .where("syncStatus")
      .equals("pending")
      .toArray();

    for (const local of pending) {
      try {
        if (local.remoteId) {
          // Update existing remote notepad
          await convex.mutation(api.notepads.updateTitle, {
            notepadId: local.remoteId as Id<"notepads">,
            title: local.title,
          });
          await convex.mutation(api.notepads.updateContent, {
            notepadId: local.remoteId as Id<"notepads">,
            content: local.content,
          });
        } else {
          // Create new remote notepad
          const remoteId = await convex.mutation(api.notepads.createNotepad, {
            title: local.title,
            content: local.content,
            date: local.date,
            tags: local.tags,
          });
          local.remoteId = remoteId;
        }
        local.syncStatus = "synced";
        await db.notepads.put(local);
        result.pushed++;
      } catch (e) {
        result.errors.push(`Failed to push ${local.date}: ${e}`);
      }
    }

    // 2. Pull remote changes from Convex
    const remoteAll = await convex.query(api.notepads.getAllByEmail, {});

    for (const remote of remoteAll) {
      // Skip tagged notepads for now (only sync main daily entries)
      if (remote.tags && remote.tags.length > 0) continue;

      const local = await db.notepads.get(remote.date);

      if (!local) {
        // New from remote - add locally
        await db.notepads.put({
          date: remote.date,
          title: remote.title,
          content: remote.content,
          tags: remote.tags,
          remoteId: remote._id,
          localUpdatedAt: Date.now(),
          syncStatus: "synced",
        });
        result.pulled++;
      } else if (local.syncStatus === "synced") {
        // No local changes - update from remote
        await db.notepads.put({
          ...local,
          title: remote.title,
          content: remote.content,
          remoteId: remote._id,
          syncStatus: "synced",
        });
        result.pulled++;
      } else if (local.syncStatus === "pending" && local.remoteId === remote._id) {
        // Conflict: both local and remote changed
        // Create duplicate entry for remote version
        const conflictDate = `${remote.date}-cloud-${Date.now()}`;
        await db.notepads.put({
          date: conflictDate,
          title: `[Cloud] ${remote.title}`,
          content: remote.content,
          remoteId: undefined,
          localUpdatedAt: Date.now(),
          syncStatus: "pending",
        });
        result.conflicts++;
      }
    }
  } catch (e) {
    result.errors.push(`Sync failed: ${e}`);
  }

  return result;
}

// Clear all local data (for testing)
export async function clearLocalData() {
  await db.notepads.clear();
}

// Get sync status summary
export async function getSyncStatus() {
  const total = await db.notepads.count();
  const pending = await db.notepads.where("syncStatus").equals("pending").count();
  const synced = await db.notepads.where("syncStatus").equals("synced").count();

  return { total, pending, synced };
}
