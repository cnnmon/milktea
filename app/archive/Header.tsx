"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Header } from "@/components/Header";
import { SyncButton } from "@/components/SyncButton";
import { useLocalAuth } from "@/hooks/useLocalAuth";

export default function ArchiveHeader() {
  const router = useRouter();
  const { logout } = useLocalAuth();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    logout();
    router.refresh();
  };

  const handleGoToToday = () => {
    startTransition(() => {
      router.push("/");
    });
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
            onClick={handleGoToToday}
            disabled={isPending}
          >
            {isPending ? (
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : (
              <ArrowRightIcon className="w-6 h-6" />
            )}
          </Button>
        </div>
      }
    />
  );
}
