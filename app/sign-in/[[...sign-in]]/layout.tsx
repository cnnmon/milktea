import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ReactNode } from "react";

export default function SignInLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <div className="flex justify-center items-center">
        <main className="flex grow flex-col">{children}</main>
      </div>
    </ConvexClientProvider>
  );
}
