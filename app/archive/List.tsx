"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { displayDate } from "@/convex/utils";
import { useQuery } from "convex/react";
import { useState, useRef } from "react";

export function List({ onClick }: { onClick?: (id: string) => void }) {
  const notepads = useQuery(api.notepads.get);
  const [swipeState, setSwipeState] = useState<{ id: string; x: number }>({
    id: "",
    x: 0,
  });
  const touchStart = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStart.current = e.touches[0].clientX;
    setSwipeState({ id, x: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.touches[0].clientX;
    setSwipeState((prev) => ({ ...prev, x: Math.max(Math.min(diff, 80), 0) }));
  };

  const handleTouchEnd = () => {
    setSwipeState((prev) => ({ ...prev, x: prev.x > 40 ? 80 : 0 }));
  };

  if (!notepads) {
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
        </div>
      )}
      {notepads.map(({ _id, title, date, tags }) => (
        <div key={_id} className="relative">
          <div
            onTouchStart={(e) => handleTouchStart(e, _id)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform:
                swipeState.id === _id
                  ? `translateX(-${swipeState.x}px)`
                  : "none",
              transition: "transform 0.2s ease",
            }}
            className="flex gap-2 justify-between items-center hover:bg-gray-300 cursor-pointer"
            onClick={() => swipeState.x === 0 && onClick?.(_id)}
          >
            <p className="medium flex-1">{title}</p>
            <div className="flex gap-2">
              {tags?.map((tag: string, index: number) => (
                <p
                  key={`${tag}-${index}`}
                  className="tiny text-gray-500 bg-gray-200 px-1"
                >
                  {tag}
                </p>
              ))}
            </div>
            <p className="small text-right text-gray-500 pr-2">
              {displayDate(date)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
