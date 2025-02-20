"use client";

import { ReactNode } from "react";

export default function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col justify-center w-full items-center">
      <div className="w-full max-w-lg flex flex-col h-screen p-4">
        {children}
      </div>
    </div>
  );
}
