"use client";

import { List } from "@/components/List";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
function NotepadHeader() {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Notepad</h1>
      <Button>
        <PlusIcon />
      </Button>
    </div>
  );
}

export default function NotepadPage() {
  const router = useRouter();
  return (
    <>
      <NotepadHeader />
      <div className="flex flex-col gap-2 pt-[50%] pb-10">
        <List onClick={(id) => router.push(`/notepad/${id}`)} />
      </div>
    </>
  );
}
