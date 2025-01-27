"use client";

import { useQuery } from "convex/react";
import NotepadEditor from "./Editor";
import { getDate } from "@/convex/utils";
import { api } from "@/convex/_generated/api";

export default function NewNotepadPage() {
  const activeNotepad = useQuery(api.notepads.getByDate, {
    date: getDate(),
  });
  return <NotepadEditor notepad={activeNotepad} />;
}
