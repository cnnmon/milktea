"use client";

import ConvexClientProvider from "@/components/ConvexClientProvider";
import SharedLayout from "@/components/SharedLayout";
import { LocalAuthGate } from "@/components/LocalAuthGate";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <LocalAuthGate>
        <SharedLayout>{children}</SharedLayout>
      </LocalAuthGate>
    </ConvexClientProvider>
  );
}
