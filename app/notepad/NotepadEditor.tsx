"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { ArrowLeftIcon, TrashIcon } from "@radix-ui/react-icons";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Header } from "../../components/Header";
import { Skeleton } from "@/components/ui/skeleton";
import Input from "./Input";

export default function NotepadEditor({
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
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (notepad) {
      setId(notepad._id);
    }
  }, [notepad]);

  const create = useCallback(
    async (newTitle?: string, newContent?: string) => {
      setIsSaving(true);
      try {
        const createdId = await createNotepad({
          title: newTitle || notepad?.title || "Untitled",
          content: newContent || notepad?.content || "",
          tags: [],
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
          return await create(newTitle, undefined);
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
          return await create(undefined, newContent);
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

  const displayDate = new Date(notepad?.date || Date.now())
    .toISOString()
    .split("T")[0];

  if (!notepad && !isNew) {
    return (
      <>
        <Header
          left={<Skeleton className="w-10 h-10 rounded-md" />}
          right={<Skeleton className="w-10 h-10 rounded-md" />}
        />
        <div className="flex flex-col gap-4 pb-10">
          <div className="pt-[50%]">
            <Skeleton className="h-10 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </div>
      </>
    );
  }

  return (
    <div>
      <Header
        left={
          <Button
            onClick={async () => {
              if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
              }
              window.location.href = "/notepad";
            }}
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Button>
        }
        right={
          <div className="flex items-center gap-2 h-10">
            {isSaving && (
              <span className="text-gray-500 font-secondary tiny">
                saving...
              </span>
            )}
            <Button
              onClick={async () => {
                if (id) {
                  await deleteNotepad({
                    notepadId: id as Id<"notepads">,
                  });
                }
                window.location.href = "/notepad";
              }}
            >
              <TrashIcon className="w-6 h-6" />
            </Button>
          </div>
        }
      />
      <div
        className="flex flex-col gap-4 pb-20 min-h-screen h-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            contentRef.current?.focus();
          }
        }}
      >
        <div className="pt-[50%] w-full">
          <Input
            value={notepad?.title || ""}
            placeholder="untitled"
            className="big font-secondary"
            updateValue={handleTitleUpdate}
            setIsSaving={setIsSaving}
          />
          <p className="text-gray-500">{displayDate}</p>
        </div>
        <Input
          ref={contentRef as React.RefObject<HTMLTextAreaElement>}
          value={notepad?.content || ""}
          placeholder="write something..."
          updateValue={handleContentUpdate}
          setIsSaving={setIsSaving}
        />
      </div>
    </div>
  );
}
