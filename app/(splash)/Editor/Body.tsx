import { Skeleton } from "@/components/ui/skeleton";
import { Doc } from "@/convex/_generated/dataModel";
import EditorInput from "./Input";
import { useRef } from "react";

export function Body({
  notepad,
  setIsSaving,
  handleTitleUpdate,
  handleContentUpdate,
}: {
  notepad: Doc<"notepads"> | null | undefined;
  setIsSaving: (isSaving: boolean) => void;
  handleTitleUpdate: (value: string) => Promise<void>;
  handleContentUpdate: (value: string) => Promise<void>;
}) {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const displayDate = new Date(notepad?.date || Date.now())
    .toISOString()
    .split("T")[0];

  if (notepad === undefined) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="pt-[40%] w-full">
        <EditorInput
          value={notepad?.title || ""}
          placeholder="untitled"
          className="big font-secondary"
          updateValue={handleTitleUpdate}
          setIsSaving={setIsSaving}
        />
        <div className="flex justify-between gap-2 items-center">
          <p className="text-gray-500">{displayDate}</p>
        </div>
      </div>
      <EditorInput
        ref={contentRef as React.RefObject<HTMLTextAreaElement>}
        value={notepad?.content || ""}
        placeholder="write something..."
        className="pb-[100%] leading-5 h-auto"
        updateValue={handleContentUpdate}
        setIsSaving={setIsSaving}
      />
    </div>
  );
}
