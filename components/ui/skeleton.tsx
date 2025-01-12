import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-full h-full bg-gray-200 animate-pulse", className)}
    ></div>
  );
}
