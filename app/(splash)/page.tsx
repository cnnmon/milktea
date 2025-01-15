"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import NotepadEditor from "./Editor";

export default function NewNotepadPage() {
  const activeNotepad = useQuery(api.notepads.getByDate, {
    date: new Date().toISOString().split("T")[0],
  });

  console.log(new Date().toISOString().split("T")[0], activeNotepad);

  return <NotepadEditor notepad={activeNotepad} />;
}
