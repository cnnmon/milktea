"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { displayDate } from "@/convex/utils";
import { useRecentNotepads } from "@/hooks/useRecentNotepads";
import { useState, useRef } from "react";
import { Cloud, CloudOff } from "lucide-react";

export function List({ onClick }: { onClick?: (date: string) => void }) {
  const { notepads, isLoading } = useRecentNotepads();
  const [swipeState, setSwipeState] = useState<{ date: string; x: number }>({
    date: "",
    x: 0,
  });
  const touchStart = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent, date: string) => {
    touchStart.current = e.touches[0].clientX;
    setSwipeState({ date, x: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.touches[0].clientX;
    setSwipeState((prev) => ({ ...prev, x: Math.max(Math.min(diff, 80), 0) }));
  };

  const handleTouchEnd = () => {
    setSwipeState((prev) => ({ ...prev, x: prev.x > 40 ? 80 : 0 }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 overflow-y-scroll pb-10 justify-between">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="flex gap-2 justify-between items-center">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 animate-in fade-in duration-500">
      {notepads.length === 0 && (
        <div className="flex flex-col gap-1 overflow-y-scroll pb-10 justify-between">
          <p className="tiny text-gray-500 text-xs">no notepads yet...</p>
          <p className="tiny text-gray-400 text-xs mt-2">
            tap + to create one, or Sync to pull from cloud
          </p>
        </div>
      )}
      {notepads.map(({ date, title, syncStatus, tags }) => (
        <div key={date} className="relative">
          <div
            onTouchStart={(e) => handleTouchStart(e, date)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform:
                swipeState.date === date
                  ? `translateX(-${swipeState.x}px)`
                  : "none",
              transition: "transform 0.2s ease",
            }}
            className="flex gap-2 justify-between items-center hover:bg-gray-300 cursor-pointer"
            onClick={() => swipeState.x === 0 && onClick?.(date)}
          >
            <p className="medium flex-1">{title || "(untitled)"}</p>
            <div className="flex items-center gap-2">
              {tags?.map((tag: string, index: number) => (
                <p
                  key={`${tag}-${index}`}
                  className="tiny text-gray-500 bg-gray-200 px-1"
                >
                  {tag}
                </p>
              ))}
              {syncStatus === "synced" ? (
                <Cloud className="w-3 h-3 text-green-500" />
              ) : (
                <CloudOff className="w-3 h-3 text-orange-400" />
              )}
              <p className="small text-right text-gray-500 pr-2">
                {displayDate(date)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
