"use client";

import NotepadEditor from "../Editor";
import { use } from "react";

export default function NotepadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // id can be either a date (YYYY-MM-DD) or legacy Convex ID
  // Local-first uses date as the key
  return <NotepadEditor date={id} />;
}
