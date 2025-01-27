"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { EditorHeader } from "./Header";
import { Body } from "./Body";
import { getDate } from "@/convex/utils";

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
    (value: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setIsSaving(true);

      saveTimeoutRef.current = setTimeout(async () => {
        if (!id) {
          const result = await createNotepad({
            title: value,
            content: "",
            date: getDate(),
          });
          setId(result);
        } else {
          await updateTitle({ notepadId: id, title: value });
        }
        setIsSaving(false);
      }, 1000);
    },
    [id, createNotepad, updateTitle],
  );

  const handleContentUpdate = useCallback(
    (value: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setIsSaving(true);

      saveTimeoutRef.current = setTimeout(async () => {
        if (!id) {
          const result = await createNotepad({
            title: "",
            content: value,
            date: getDate(),
          });
          setId(result);
        } else {
          await updateContent({ notepadId: id, content: value });
        }
        setIsSaving(false);
      }, 1000);
    },
    [id, createNotepad, updateContent],
  );

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
            deleteNotepad({ notepadId: id });
          }
          window.location.href = "/archive";
        }}
        isSaving={isSaving}
      />
      <div className="flex flex-col gap-4">
        <Body
          notepad={notepad}
          setIsSaving={setIsSaving}
          handleTitleUpdate={handleTitleUpdate}
          handleContentUpdate={handleContentUpdate}
        />
      </div>
    </>
  );
}
