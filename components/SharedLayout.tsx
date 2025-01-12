import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export default async function SharedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    redirect("/signin");
  }

  return (
    <div className="flex flex-col justify-center w-full items-center text-left">
      <div className="w-full max-w-md flex flex-col h-screen p-4">
        {children}
      </div>
    </div>
  );
}
