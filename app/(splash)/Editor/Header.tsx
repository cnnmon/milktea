import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

export function EditorHeader({
  onExit,
  isSaving,
  onDelete,
}: {
  onExit: () => void;
  onDelete: () => void;
  isSaving: boolean;
}) {
  return (
    <Header
      left={
        <Button onClick={onExit}>
          <ArrowLeftIcon className="w-6 h-6" />
        </Button>
      }
      right={
        <div className="flex items-center gap-2 h-10">
          {isSaving && <span className="text-gray-500  tiny">saving...</span>}
          <Button onClick={onDelete}>
            <TrashIcon className="w-6 h-6" />
          </Button>
        </div>
      }
    />
  );
}
