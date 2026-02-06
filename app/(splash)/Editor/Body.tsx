import { Skeleton } from "@/components/ui/skeleton";
import { LocalNotepad } from "@/lib/db";
import { displayDate } from "@/convex/utils";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

export function Body({
  notepad,
  isLoading,
  handleTitleUpdate,
  handleContentUpdate,
}: {
  notepad: LocalNotepad | null;
  isLoading: boolean;
  handleTitleUpdate: (value: string) => void;
  handleContentUpdate: (value: string) => void;
}) {
  const [localTitle, setLocalTitle] = useState("");
  const [localContent, setLocalContent] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (notepad && !initialized.current) {
      setLocalTitle(notepad.title || "");
      setLocalContent(notepad.content || "");
      initialized.current = true;
    }
  }, [notepad]);

  // Reset when notepad changes (different date)
  useEffect(() => {
    if (notepad) {
      setLocalTitle(notepad.title || "");
      setLocalContent(notepad.content || "");
    }
  }, [notepad?.date]);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-10 w-[200px] mb-2 animate-[pulse_2s_ease-in-out_infinite] opacity-40" />
        <Skeleton className="h-2 w-[100px] animate-[pulse_2s_ease-in-out_infinite] opacity-40" />
        <br />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full animate-[pulse_2s_ease-in-out_infinite] opacity-40" />
        </div>
      </>
    );
  }

  return (
    <div className="animate-slide-up">
      <TextareaAutosize
        value={localTitle}
        placeholder="untitled"
        spellCheck={false}
        className="big font-secondary bg-transparent outline-none resize-none w-full smooth-transition hover:opacity-90"
        onChange={(e) => {
          setLocalTitle(e.target.value);
          handleTitleUpdate(e.target.value);
        }}
      />
      <p className="text-gray-500 mt-[-10px] animate-fade">
        {notepad ? displayDate(notepad.date) : ""}
      </p>
      <br />
      <TextareaAutosize
        ref={contentRef as React.RefObject<HTMLTextAreaElement>}
        value={localContent}
        placeholder="write something..."
        spellCheck={false}
        className="body pb-[100%] leading-5 h-auto resize-none bg-transparent outline-none smooth-transition hover:opacity-90 w-full"
        onChange={(e) => {
          setLocalContent(e.target.value);
          handleContentUpdate(e.target.value);
        }}
      />
    </div>
  );
}
