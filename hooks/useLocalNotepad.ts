"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { db, LocalNotepad, getTodayDate } from "@/lib/db";

export function useLocalNotepad(date?: string) {
  const targetDate = date || getTodayDate();
  const [notepad, setNotepad] = useState<LocalNotepad | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from IndexedDB on mount - INSTANT
  useEffect(() => {
    setIsLoading(true);
    db.notepads.get(targetDate).then((entry) => {
      if (entry) {
        setNotepad(entry);
      } else {
        // Create empty entry for this date
        const newEntry: LocalNotepad = {
          date: targetDate,
          title: "",
          content: "",
          localUpdatedAt: Date.now(),
          syncStatus: "pending",
        };
        db.notepads.put(newEntry);
        setNotepad(newEntry);
      }
      setIsLoading(false);
    });
  }, [targetDate]);

  // Debounced save to IndexedDB
  const saveToDb = useCallback(
    (updated: LocalNotepad) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        db.notepads.put(updated);
      }, 300);
    },
    []
  );

  // Update content locally - INSTANT
  const updateContent = useCallback(
    (content: string) => {
      if (!notepad) return;
      const updated: LocalNotepad = {
        ...notepad,
        content,
        localUpdatedAt: Date.now(),
        syncStatus: "pending",
      };
      setNotepad(updated);
      saveToDb(updated);
    },
    [notepad, saveToDb]
  );

  // Update title locally - INSTANT
  const updateTitle = useCallback(
    (title: string) => {
      if (!notepad) return;
      const updated: LocalNotepad = {
        ...notepad,
        title,
        localUpdatedAt: Date.now(),
        syncStatus: "pending",
      };
      setNotepad(updated);
      saveToDb(updated);
    },
    [notepad, saveToDb]
  );

  // Delete notepad (tracks remoteId so sync can delete from Convex)
  const deleteNotepad = useCallback(async () => {
    if (!notepad) return;
    if (notepad.remoteId) {
      await db.deletedNotepads.put({ remoteId: notepad.remoteId });
    }
    await db.notepads.delete(targetDate);
    setNotepad(null);
  }, [notepad, targetDate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    notepad,
    isLoading,
    updateContent,
    updateTitle,
    deleteNotepad,
  };
}
