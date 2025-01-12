"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import NotepadEditor from "@/components/NotepadEditor";

export default function NotepadPage() {
  const params = useParams();
  const notepad = useQuery(api.notepads.getById, {
    notepadId: params.id as Id<"notepads">,
  });

  return <NotepadEditor notepad={notepad || undefined} />;
}
