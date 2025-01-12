"use client";

import { Header } from "@/components/Header";
import { List } from "@/components/List";
import { Button } from "@/components/ui/button";
import { PlusIcon, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthActions } from "@convex-dev/auth/react";

export default function NotepadPage() {
  const router = useRouter();
  const { signOut } = useAuthActions();
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
              <DropdownMenuItem onClick={() => router.push("/toys")}>
                toys
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
        right={
          <Button onClick={() => router.push("/notepad/new")}>
            <PlusIcon />
          </Button>
        }
      />
      <div className="flex flex-col gap-2 pt-[50%] pb-10">
        <List onClick={(id) => router.push(`/notepad/${id}`)} />
      </div>
    </>
  );
}
