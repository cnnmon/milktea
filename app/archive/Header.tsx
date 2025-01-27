import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  Cross1Icon,
  CrumpledPaperIcon,
} from "@radix-ui/react-icons";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { getDate } from "@/convex/utils";

export default function ArchiveHeader() {
  const router = useRouter();
  const { signOut } = useClerk();
  const createNotepad = useMutation(api.notepads.createNotepad);

  const handleCreateQuickNote = async () => {
    const newNotepadId = await createNotepad({
      title: "quick note",
      content: "",
      tags: ["quick"],
      date: getDate(),
    });
    if (newNotepadId) {
      router.push(`/${newNotepadId}`);
    }
  };

  return (
    <Header
      left={
        <Button
          onClick={() =>
            signOut().then(() => {
              router.push("/sign-in");
            })
          }
          className="hover-lift"
        >
          <Cross1Icon className="w-5 h-5" />
        </Button>
      }
      right={
        <div className="flex gap-4 items-end">
          <div className="flex items-center gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateQuickNote();
              }}
              className="hover-lift"
            >
              <CrumpledPaperIcon className="w-6 h-6" />
            </Button>
          </div>
          <Button
            className="flex gap-2 hover-lift"
            onClick={() => router.push("/")}
          >
            <ArrowRightIcon className="w-6 h-6" />
          </Button>
        </div>
      }
    />
  );
}
