"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function Name({ viewer }: { viewer?: { name?: string } }) {
  const router = useRouter();
  const authActions = useAuthActions();

  if (!viewer?.name) {
    return <Skeleton className="h-6 w-14" />;
  }
  return (
    <p className="font-secondary flex gap-1 items-center">
      <span className="mb-[-2px]">{viewer.name}</span>
      <Button
        onClick={() => {
          authActions.signOut();
          router.push("/signin");
        }}
      >
        [x]
      </Button>
    </p>
  );
}
