import Dexie, { Table } from "dexie";

// Local notepad stored in IndexedDB
export interface LocalNotepad {
  date: string; // "2026-02-06" - primary key
  title: string;
  content: string;
  tags?: string[];
  localUpdatedAt: number; // timestamp of last local edit
  remoteId?: string; // Convex _id once synced
  syncStatus: "synced" | "pending" | "conflict";
}

class MilkteaDB extends Dexie {
  notepads!: Table<LocalNotepad>;

  constructor() {
    super("milktea");
    this.version(1).stores({
      notepads: "date, syncStatus, localUpdatedAt",
    });
  }
}

export const db = new MilkteaDB();

// Helper to get today's date string
export function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// Delete empty notepads that aren't from today
export async function cleanupEmptyNotepads() {
  const today = getTodayDate();
  const all = await db.notepads.toArray();
  const emptyDates = all
    .filter((n) => n.date !== today && !n.title.trim() && !n.content.trim())
    .map((n) => n.date);
  if (emptyDates.length > 0) {
    await db.notepads.bulkDelete(emptyDates);
  }
}
