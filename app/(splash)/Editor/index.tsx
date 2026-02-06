"use client";

import React, { useCallback, useState } from "react";
import { EditorHeader } from "./Header";
import { Body } from "./Body";
import { useLocalNotepad } from "@/hooks/useLocalNotepad";
import { useRouter } from "next/navigation";

export default function Editor({ date }: { date?: string }) {
  const { notepad, isLoading, updateContent, updateTitle, deleteNotepad } =
    useLocalNotepad(date);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleTitleUpdate = useCallback(
    (value: string) => {
      setIsSaving(true);
      updateTitle(value);
      setTimeout(() => setIsSaving(false), 300);
    },
    [updateTitle]
  );

  const handleContentUpdate = useCallback(
    (value: string) => {
      setIsSaving(true);
      updateContent(value);
      setTimeout(() => setIsSaving(false), 300);
    },
    [updateContent]
  );

  const handleDelete = useCallback(() => {
    deleteNotepad();
    router.push("/archive");
  }, [deleteNotepad, router]);

  return (
    <div className="flex flex-col h-screen">
      <EditorHeader isSaving={isSaving} onDelete={handleDelete} />
      <div className="pt-[40%]">
        <Body
          notepad={notepad}
          isLoading={isLoading}
          handleTitleUpdate={handleTitleUpdate}
          handleContentUpdate={handleContentUpdate}
        />
      </div>
    </div>
  );
}
