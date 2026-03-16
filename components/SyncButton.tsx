"use client";

import { useState } from "react";
import { useConvex } from "convex/react";
import { syncAll, SyncResult } from "@/lib/sync";
import { cleanupEmptyNotepads } from "@/lib/db";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { usePendingCount } from "@/hooks/useRecentNotepads";
import { Cloud, CloudOff, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

type SyncStatus = "idle" | "syncing" | "done" | "offline" | "error";

export function SyncButton() {
  const convex = useConvex();
  const pendingCount = usePendingCount();
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [result, setResult] = useState<SyncResult | null>(null);

  const handleSync = async () => {
    if (!navigator.onLine) {
      setStatus("offline");
      setTimeout(() => setStatus("idle"), 2000);
      return;
    }

    setStatus("syncing");
    try {
      const r = await syncAll(convex);
      const deleted = await cleanupEmptyNotepads();
      for (const n of deleted) {
        if (n.remoteId) {
          try {
            await convex.mutation(api.notepads.deleteNotepad, {
              notepadId: n.remoteId as Id<"notepads">,
            });
          } catch {}
        }
      }
      setResult(r);
      if (r.errors.length > 0) {
        setStatus("error");
      } else {
        setStatus("done");
      }
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      console.error("Sync error:", e);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const getIcon = () => {
    switch (status) {
      case "syncing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "done":
        return <Check className="w-4 h-4 text-green-500" />;
      case "offline":
        return <CloudOff className="w-4 h-4 text-orange-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Cloud className="w-4 h-4" />;
    }
  };

  const getText = () => {
    switch (status) {
      case "syncing":
        return "Syncing...";
      case "done":
        return result
          ? `↑${result.pushed} ↓${result.pulled}`
          : "Done";
      case "offline":
        return "Offline";
      case "error":
        return "Error";
      default:
        return pendingCount > 0 && ` (${pendingCount})`;
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={status === "syncing"}
      className="hover-lift p-1 flex gap-1"
    >
      {getIcon()}
      <span>{getText()}</span>
    </Button>
  );
}
