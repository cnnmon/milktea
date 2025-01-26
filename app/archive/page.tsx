"use client";

import { Header } from "@/components/Header";
import { List } from "./List";
import { Button } from "@/components/ui/button";
import { Menu, ArrowRightIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function NotepadPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  return (
    <>
      <Header
        left={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <button
                  className="flex gap-2 font-primary tiny"
                  onClick={() =>
                    signOut().then(() => {
                      router.push("/sign-in");
                    })
                  }
                >
                  sign out *･゜ﾟ
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
        right={
          <Button onClick={() => router.push("/")}>
            <ArrowRightIcon />
          </Button>
        }
      />
      <div className="flex flex-col gap-10 pt-[50%] sm:pt-[40%] pb-10">
        <div>
          <List onClick={(id) => router.push(`/${id}`)} />
        </div>
      </div>
    </>
  );
}
