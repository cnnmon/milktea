import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-gray-500 tiny animate-fade">saving...</span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="hover-lift">
                <DotsVerticalIcon className="w-4 h-4 smooth-transition hover:scale-110" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#EFEFEF] border border-black"
            >
              <DropdownMenuItem
                onClick={onDelete}
                className="cursor-pointer hover:bg-primary"
              >
                delete?
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    />
  );
}
