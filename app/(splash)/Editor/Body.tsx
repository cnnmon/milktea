import { Skeleton } from "@/components/ui/skeleton";
import { Doc } from "@/convex/_generated/dataModel";
import { displayDate } from "@/convex/utils";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

export function Body({
  notepad,
  setIsSaving,
  handleTitleUpdate,
  handleContentUpdate,
}: {
  notepad: Doc<"notepads"> | null | undefined;
  setIsSaving: (isSaving: boolean) => void;
  handleTitleUpdate: (value: string) => void;
  handleContentUpdate: (value: string) => void;
}) {
  const [localTitle, setLocalTitle] = useState("");
  const [localContent, setLocalContent] = useState("");

  useEffect(() => {
    if (notepad && localTitle === "" && localContent === "") {
      setLocalTitle(notepad.title || "");
      setLocalContent(notepad.content || "");
    }
  }, [notepad, localTitle, localContent]);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  if (notepad === undefined) {
    return (
      <>
        <div className="pt-[40%]">
          <Skeleton className="h-10 w-[200px] mb-2" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="pt-[40%]">
        <TextareaAutosize
          value={localTitle}
          placeholder="untitled"
          className="big font-secondary bg-transparent outline-none resize-none w-full"
          onChange={(e) => {
            setIsSaving(true);
            setLocalTitle(e.target.value);
            handleTitleUpdate(e.target.value);
          }}
        />
        <div className="flex justify-between gap-2 items-center">
          <p className="text-gray-500">{displayDate(notepad?.date)}</p>
        </div>
      </div>
      <TextareaAutosize
        ref={contentRef as React.RefObject<HTMLTextAreaElement>}
        value={localContent}
        placeholder="write something..."
        className="body pb-[100%] leading-5 h-auto resize-none bg-transparent outline-none"
        onChange={(e) => {
          setIsSaving(true);
          setLocalContent(e.target.value);
          handleContentUpdate(e.target.value);
        }}
      />
    </>
  );
}
