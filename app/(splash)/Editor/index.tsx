"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { EditorHeader } from "./Header";
import { Body } from "./Body";
import { getDate } from "@/convex/utils";
import { useRouter } from "next/navigation";

export default function Editor({
  notepad,
}: {
  notepad: Doc<"notepads"> | null | undefined;
}) {
  const createNotepad = useMutation(api.notepads.createNotepad);
  const updateTitle = useMutation(api.notepads.updateTitle);
  const updateContent = useMutation(api.notepads.updateContent);
  const deleteNotepad = useMutation(api.notepads.deleteNotepad);
  const router = useRouter();

  const [id, setId] = useState<Id<"notepads"> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<{
    title?: string;
    content?: string;
  }>({});

  useEffect(() => {
    if (notepad) {
      setId(notepad._id);
    }
  }, [notepad]);

  // debounced save function
  const debouncedSave = useCallback(async () => {
    const updates = pendingUpdatesRef.current;
    pendingUpdatesRef.current = {};

    if (Object.keys(updates).length === 0) return;

    setIsSaving(true);
    try {
      if (!id) {
        const result = await createNotepad({
          title: updates.title || "",
          content: updates.content || "",
          date: getDate(),
        });
        setId(result);
      } else {
        if (updates.title !== undefined) {
          await updateTitle({ notepadId: id, title: updates.title });
        }
        if (updates.content !== undefined) {
          await updateContent({ notepadId: id, content: updates.content });
        }
      }
    } finally {
      setIsSaving(false);
    }
  }, [id, createNotepad, updateTitle, updateContent]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        debouncedSave();
      }
    };
  }, [debouncedSave]);

  const handleTitleUpdate = useCallback(
    (value: string) => {
      pendingUpdatesRef.current.title = value;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(debouncedSave, 1000);
    },
    [debouncedSave],
  );

  const handleContentUpdate = useCallback(
    (value: string) => {
      pendingUpdatesRef.current.content = value;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(debouncedSave, 1000);
    },
    [debouncedSave],
  );

  const handleDelete = useCallback(() => {
    if (id) {
      deleteNotepad({ notepadId: id });
      router.push("/archive");
    }
  }, [id, deleteNotepad, router]);

  return (
    <div className="flex flex-col h-screen">
      <EditorHeader isSaving={isSaving} onDelete={handleDelete} />
      <div className="pt-[40%]">
        <Body
          notepad={notepad}
          setIsSaving={setIsSaving}
          handleTitleUpdate={handleTitleUpdate}
          handleContentUpdate={handleContentUpdate}
        />
      </div>
    </div>
  );
}
