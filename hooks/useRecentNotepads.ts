"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, LocalNotepad } from "@/lib/db";

export function useRecentNotepads(limit = 90) {
  const notepads = useLiveQuery(
    () =>
      db.notepads.orderBy("date").reverse().limit(limit).toArray(),
    [limit]
  );

  return {
    notepads: notepads ?? [],
    isLoading: notepads === undefined,
  };
}

export function usePendingCount() {
  const count = useLiveQuery(
    () => db.notepads.where("syncStatus").equals("pending").count(),
    []
  );

  return count ?? 0;
}
