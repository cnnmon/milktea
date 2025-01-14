"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { EditorHeader } from "./Header";
import { Body } from "./Body";

export default function Editor({
  notepad,
  isNew = false,
}: {
  notepad?: Doc<"notepads">;
  isNew?: boolean;
}) {
  const createNotepad = useMutation(api.notepads.create);
  const updateTitle = useMutation(api.notepads.updateTitle);
  const updateContent = useMutation(api.notepads.updateContent);
  const deleteNotepad = useMutation(api.notepads.deleteNotepad);

  const [id, setId] = useState<Id<"notepads"> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const create = useCallback(
    async (newTitle?: string, newContent?: string, newTags?: string[]) => {
      setIsSaving(true);
      try {
        const createdId = await createNotepad({
          title: newTitle || notepad?.title || "Untitled",
          content: newContent || notepad?.content || "",
          tags: newTags || notepad?.tags || [],
        });
        setId(createdId);
      } finally {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          setIsSaving(false);
        }, 1000);
      }
    },
    [notepad, createNotepad],
  );

  const handleTitleUpdate = useCallback(
    async (newTitle: string) => {
      setIsSaving(true);
      try {
        if (!id) {
          return await create(newTitle, undefined, undefined);
        }
        await updateTitle({
          notepadId: id as Id<"notepads">,
          title: newTitle,
        });
      } finally {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          setIsSaving(false);
        }, 1000);
      }
    },
    [id, updateTitle, create],
  );

  const handleContentUpdate = useCallback(
    async (newContent: string) => {
      setIsSaving(true);
      try {
        if (!id) {
          return await create(undefined, newContent, undefined);
        }
        await updateContent({
          notepadId: id as Id<"notepads">,
          content: newContent,
        });
      } finally {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          setIsSaving(false);
        }, 1000);
      }
    },
    [id, updateContent, create],
  );

  useEffect(() => {
    if (notepad) {
      setId(notepad._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <EditorHeader
        notepad={notepad}
        onExit={() => {
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          window.location.href = "/";
        }}
        onDelete={() => {
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          if (id) {
            deleteNotepad({ notepadId: id as Id<"notepads"> });
          }
          window.location.href = "/";
        }}
        isSaving={isSaving}
      />
      <Body
        notepad={notepad}
        isNew={isNew}
        setIsSaving={setIsSaving}
        handleTitleUpdate={handleTitleUpdate}
        handleContentUpdate={handleContentUpdate}
      />
    </>
  );
}
