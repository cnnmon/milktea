import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
