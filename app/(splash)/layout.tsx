import ConvexClientProvider from "@/components/ConvexClientProvider";
import SharedLayout from "@/components/SharedLayout";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <SharedLayout>{children}</SharedLayout>
    </ConvexClientProvider>
  );
}
