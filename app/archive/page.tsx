"use client";

import ArchiveHeader from "./Header";
import { List } from "./List";
import { useRouter } from "next/navigation";

export default function NotepadPage() {
  const router = useRouter();

  return (
    <>
      <ArchiveHeader />
      <div className="flex flex-col gap-10 pt-[50%] sm:pt-[40%] pb-10">
        <div>
          <List onClick={(id) => router.push(`/${id}`)} />
        </div>
      </div>
    </>
  );
}
