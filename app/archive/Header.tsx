"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { SyncButton } from "@/components/SyncButton";
import { useLocalAuth } from "@/hooks/useLocalAuth";

export default function ArchiveHeader() {
  const router = useRouter();
  const { logout } = useLocalAuth();

  const handleSignOut = () => {
    logout();
    // Also clear server cookie if it exists
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <Header
      left={
        <Button onClick={handleSignOut} className="hover-lift">
          <Cross1Icon className="w-5 h-5" />
        </Button>
      }
      right={
        <div className="flex gap-2 items-center">
          <SyncButton />
          <Button
            className="flex gap-2 hover-lift"
            onClick={() => router.push("/")}
          >
            <ArrowRightIcon className="w-6 h-6" />
          </Button>
        </div>
      }
    />
  );
}
