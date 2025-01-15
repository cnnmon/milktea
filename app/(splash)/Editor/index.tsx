"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { EditorHeader } from "./Header";
import { Body } from "./Body";

export default function Editor({
  notepad,
}: {
  notepad: Doc<"notepads"> | null | undefined;
}) {
  const createNotepad = useMutation(api.notepads.createNotepad);
  const updateTitle = useMutation(api.notepads.updateTitle);
  const updateContent = useMutation(api.notepads.updateContent);
  const deleteNotepad = useMutation(api.notepads.deleteNotepad);

  const [id, setId] = useState<Id<"notepads"> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (notepad) {
      setId(notepad._id);
    }
  }, [notepad]);

  const handleTitleUpdate = useCallback(
    async (newTitle: string) => {
      setIsSaving(true);
      try {
        if (!id) {
          await createNotepad({
            title: newTitle,
            content: "",
          });
          return;
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
    [id, updateTitle, createNotepad],
  );

  const handleContentUpdate = useCallback(
    async (newContent: string) => {
      setIsSaving(true);
      try {
        if (!id) {
          const createdId = await createNotepad({
            title: "Untitled",
            content: newContent,
          });
          setId(createdId);
          return;
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
    [id, updateContent, createNotepad],
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
        onExit={() => {
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          window.location.href = "/archive";
        }}
        onDelete={() => {
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          if (id) {
            deleteNotepad({ notepadId: id as Id<"notepads"> });
          }
          window.location.href = "/archive";
        }}
        isSaving={isSaving}
      />
      <Body
        notepad={notepad}
        setIsSaving={setIsSaving}
        handleTitleUpdate={handleTitleUpdate}
        handleContentUpdate={handleContentUpdate}
      />
    </>
  );
}
