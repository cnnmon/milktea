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

export interface DeletedNotepad {
  remoteId: string;
}

class MilkteaDB extends Dexie {
  notepads!: Table<LocalNotepad>;
  deletedNotepads!: Table<DeletedNotepad>;

  constructor() {
    super("milktea");
    this.version(1).stores({
      notepads: "date, syncStatus, localUpdatedAt",
    });
    this.version(2).stores({
      notepads: "date, syncStatus, localUpdatedAt",
      deletedNotepads: "remoteId",
    });
  }
}

export const db = new MilkteaDB();

// Helper to get today's date string
export function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// Delete empty notepads that aren't from today, returns deleted entries for remote cleanup
export async function cleanupEmptyNotepads(): Promise<LocalNotepad[]> {
  const today = getTodayDate();
  const all = await db.notepads.toArray();
  const empty = all.filter(
    (n) => n.date !== today && !(n.title || "").trim() && !(n.content || "").trim()
  );
  if (empty.length > 0) {
    await db.notepads.bulkDelete(empty.map((n) => n.date));
  }
  return empty;
}
