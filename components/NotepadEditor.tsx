"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { DotsVerticalIcon, ArrowLeftIcon } from "@radix-ui/react-icons";
import React, { useState, useEffect, useRef } from "react";
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
  const [title, setTitle] = useState(notepad?.title || "");
  const [content, setContent] = useState(notepad?.content || "");
  const [createdId, setCreatedId] = useState<Id<"notepads"> | null>(
    notepad?._id || null,
  );

  const createNotepad = useMutation(api.notepads.create);
  const updateNotepad = useMutation(api.notepads.update);

  const lastSavedTitle = useRef(notepad?.title || "");
  const lastSavedContent = useRef(notepad?.content || "");

  useEffect(() => {
    setTitle(notepad?.title || "");
    setContent(notepad?.content || "");
    setCreatedId(notepad?._id || null);
    lastSavedTitle.current = notepad?.title || "";
    lastSavedContent.current = notepad?.content || "";
  }, [notepad]);

  const handleUpdate = async (newTitle: string, newContent: string) => {
    if (!newTitle.trim() && !newContent.trim()) {
      return;
    }

    const titleChanged = newTitle.trim() !== lastSavedTitle.current.trim();
    const contentChanged =
      newContent.trim() !== lastSavedContent.current.trim();

    if (!titleChanged && !contentChanged) {
      return;
    }

    if (!createdId) {
      const id = await createNotepad({
        title: newTitle,
        content: newContent,
        tags: [],
      });
      setCreatedId(id);
    } else {
      await updateNotepad({
        notepadId: createdId,
        title: newTitle,
        content: newContent,
      });
    }

    lastSavedTitle.current = newTitle;
    lastSavedContent.current = newContent;
  };

  const handleContentChange = (e: React.FocusEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerText
      .replace(/\u00A0/g, " ")
      .replace(/\r\n|\r|\n/g, "\n");
    setContent(content);
  };

  const displayDate = new Date(notepad?._creationTime || Date.now())
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    .replace(/ /g, "");

  if (!notepad && !isNew) {
    return (
      <>
        <Header
          left={<Skeleton className="w-10 h-10 rounded-md" />}
          right={<Skeleton className="w-10 h-10 rounded-md" />}
        />
        <div className="flex flex-col gap-4 overflow-y-auto pb-10">
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
              await handleUpdate(title, content);
              router.push("/notepad");
            }}
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Button>
        }
        right={
          <Button onClick={() => {}}>
            <DotsVerticalIcon className="w-4 h-4" />
          </Button>
        }
      />

      <div className="flex flex-col gap-4 overflow-y-scroll pb-10 overflow-x-hidden">
        <div className="pt-[50%]">
          <input
            className="big font-secondary font-bold bg-transparent h-10 focus:outline-none"
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleUpdate(title, content)}
            value={title}
            placeholder="Untitled"
          />
          <p className="text-gray-500">{displayDate}</p>
        </div>
        <div
          className="gap-4 whitespace-pre-wrap bg-transparent w-full focus:outline-none h-screen"
          contentEditable
          onBlur={(e) => {
            handleContentChange(e);
            handleUpdate(title, content);
          }}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br>") }}
          spellCheck={false}
        />
      </div>
    </>
  );
}
