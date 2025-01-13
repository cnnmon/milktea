"use client";

import NotepadEditor from "../Editor";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";

export default function NotepadPage() {
  const params = useParams();
  const notepad = useQuery(api.notepads.getById, {
    notepadId: params.id as Id<"notepads">,
  });
  return <NotepadEditor notepad={notepad ?? undefined} />;
}
