import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ReactNode } from "react";

export default function SignInLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <div className="flex justify-center items-center">
        <main className="flex grow flex-col">{children}</main>
        <div className="fixed bottom-0 p-4 w-full">
          <p>welcome to my equivalent of apple notes</p>
          <p>hope you like</p>
        </div>
      </div>
    </ConvexClientProvider>
  );
}
