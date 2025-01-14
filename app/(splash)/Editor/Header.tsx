import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useMutation } from "convex/react";
import { X } from "lucide-react";
import { useCallback, useState } from "react";

export function EditorHeader({
  notepad,
  onExit,
  isSaving,
  onDelete,
}: {
  notepad?: Doc<"notepads">;
  onExit: () => void;
  onDelete: () => void;
  isSaving: boolean;
}) {
  const updateTags = useMutation(api.notepads.updateTags);
  const [newTag, setNewTag] = useState("");

  const handleTagsUpdate = useCallback(
    async (newTags: string[]) => {
      await updateTags({
        notepadId: notepad?._id as Id<"notepads">,
        tags: newTags,
      });
    },
    [updateTags, notepad],
  );

  const addTag = async (tag: string) => {
    if (!tag.trim()) return;
    const updatedTags = [...(notepad?.tags || []), tag.trim()];
    await handleTagsUpdate(updatedTags);
    setNewTag("");
  };

  const removeTag = async (tagToRemove: string) => {
    const updatedTags = (notepad?.tags || []).filter(
      (tag) => tag !== tagToRemove,
    );
    await handleTagsUpdate(updatedTags);
  };

  return (
    <Header
      left={
        <Button onClick={onExit}>
          <ArrowLeftIcon className="w-6 h-6" />
        </Button>
      }
      right={
        <div className="flex items-center gap-2 h-10">
          <div className="flex gap-2 items-center tiny">
            {notepad?.tags?.map((tag) => (
              <span
                key={tag}
                className="gap-1 flex items-center bg-gray-300 px-2 py-1"
              >
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeTag(tag)}
                />
              </span>
            ))}
            <div className="flex items-center gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(newTag);
                  }
                }}
                className="h-6 w-20 font-primary"
                placeholder="(tag)"
              />
              <Button className="h-6 w-6" onClick={() => addTag(newTag)}>
                <PlusIcon className="cursor-pointer" />
              </Button>
            </div>
          </div>
          {isSaving && (
            <span className="text-gray-500 font-secondary tiny">saving...</span>
          )}
          <Button onClick={onDelete}>
            <TrashIcon className="w-6 h-6" />
          </Button>
        </div>
      }
    />
  );
}
