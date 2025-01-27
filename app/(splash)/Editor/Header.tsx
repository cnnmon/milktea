import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

export function EditorHeader({
  isSaving,
  onDelete,
}: {
  isSaving: boolean;
  onDelete: () => void;
}) {
  const router = useRouter();

  const handleExit = () => {
    router.push("/archive");
  };

  return (
    <Header
      left={
        <Button onClick={handleExit} className="hover-lift">
          <ArrowLeftIcon className="w-6 h-6 smooth-transition hover:scale-110" />
        </Button>
      }
      right={
        <div className="flex items-center gap-2 h-10">
          {isSaving && (
            <span className="text-gray-500 tiny animate-fade">saving...</span>
          )}
          <Button onClick={onDelete} className="hover-lift">
            <TrashIcon className="w-6 h-6 smooth-transition hover:scale-110" />
          </Button>
        </div>
      }
    />
  );
}
