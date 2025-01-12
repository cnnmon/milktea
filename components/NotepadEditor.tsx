"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { ArrowLeftIcon, TrashIcon } from "@radix-ui/react-icons";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Header } from "./Header";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotepadEditor({
  notepad,
  isNew = false,
}: {
  notepad?: Doc<"notepads">;
  isNew?: boolean;
}) {
  const router = useRouter();
  const createNotepad = useMutation(api.notepads.create);
  const updateNotepad = useMutation(api.notepads.update);
  const deleteNotepad = useMutation(api.notepads.deleteNotepad);

  const [id, setId] = useState("");
  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notepad) return;
    setId(notepad._id);
    setTitle(notepad.title);
    setContent(notepad.content);
  }, [notepad]);
  const handleUpdate = useCallback(
    async (newTitle: string | undefined, newContent: string | undefined) => {
      // skip if no new values provided
      if (!newTitle?.trim() && !newContent?.trim()) return;

      // only proceed if values have actually changed
      const titleChanged =
        newTitle && newTitle.trim() !== notepad?.title.trim();
      const contentChanged =
        newContent && newContent.trim() !== notepad?.content.trim();

      // return early if nothing changed
      if (!titleChanged && !contentChanged) return;
      if (newTitle === "Untitled" || newContent === "") {
        return;
      }

      // clear any pending save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setIsSaving(true);

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (!id) {
            const createdId = await createNotepad({
              title: newTitle || "",
              content: newContent || "",
              tags: [],
            });
            setId(createdId);
          } else {
            await updateNotepad({
              notepadId: id as Id<"notepads">,
              title: newTitle || title,
              content: newContent || content,
            });
          }
        } finally {
          setIsSaving(false);
          saveTimeoutRef.current = null;
        }
      }, 1000);
    },
    [
      id,
      notepad?.title,
      notepad?.content,
      title,
      content,
      createNotepad,
      updateNotepad,
    ],
  );

  const handleTitleUpdate = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      const newTitle = e.currentTarget.innerHTML.replace(/\n+/g, "\n\n") || "";
      setTitle(newTitle);
      handleUpdate(newTitle, undefined);
    },
    [handleUpdate],
  );

  const handleContentUpdate = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      const newContent = e.currentTarget.innerHTML.replace(/\n+/g, "\n\n");
      setContent(newContent);
      handleUpdate(undefined, newContent);
    },
    [handleUpdate],
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
    <>
      <Header
        left={
          <Button
            onClick={async () => {
              if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                await handleUpdate(title, content);
              }
              router.push("/notepad");
            }}
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Button>
        }
        right={
          <div className="flex items-center gap-2 h-10">
            {isSaving && (
              <span className="text-gray-500 font-secondary">saving...</span>
            )}
            <Button
              onClick={async () => {
                if (id) {
                  await deleteNotepad({
                    notepadId: id as Id<"notepads">,
                  });
                }
                router.push("/notepad");
              }}
            >
              <TrashIcon className="w-6 h-6" />
            </Button>
          </div>
        }
      />
      <div className="flex flex-col gap-4 pb-20 h-auto">
        <div className="pt-[50%] w-full">
          <div
            ref={titleRef}
            className="big font-secondary bg-transparent focus:outline-none leading-8 h-auto"
            contentEditable
            onChange={handleTitleUpdate}
            onBlur={handleTitleUpdate}
            suppressContentEditableWarning
            data-placeholder="Untitled"
            dangerouslySetInnerHTML={{
              __html: title.replace(/\n+/g, "<br><br>"),
            }}
            style={{ minHeight: "1em" }}
          />
          <p className="text-gray-500">{displayDate}</p>
        </div>
        <div
          ref={contentRef}
          className="gap-4 whitespace-pre-wrap bg-transparent w-full focus:outline-none h-auto"
          contentEditable
          onChange={handleContentUpdate}
          onBlur={handleContentUpdate}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{
            __html: content.replace(/\n+/g, "<br><br>"),
          }}
          spellCheck={false}
        />
      </div>
    </>
  );
}
