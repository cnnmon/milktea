"use client";

import { ReactNode } from "react";

export default function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col justify-center w-full items-center text-left">
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <div className="w-full max-w-xl flex flex-col h-screen p-4">
        {children}
      </div>
    </div>
  );
}
