"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { useState, useRef } from "react";
import { TrashIcon } from "@radix-ui/react-icons";

export function List({ onClick }: { onClick?: (id: string) => void }) {
  const notepads = useQuery(api.notepads.get);
  const deleteNotepad = useMutation(api.notepads.deleteNotepad);
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

  const handleDelete = (id: string) => {
    deleteNotepad({ notepadId: id as Id<"notepads"> });
    setSwipeState({ id: "", x: 0 });
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
    <>
      {notepads.length === 0 && (
        <div className="flex flex-col gap-1 overflow-y-scroll pb-10 justify-between">
          <p className="tiny text-gray-500">no notepads</p>
        </div>
      )}
      {notepads.map(({ _id, title, date }) => (
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
            <p className="small text-right text-gray-500 pr-2">
              {new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          {swipeState.id === _id && swipeState.x > 0 && (
            <div
              className="absolute right-0 top-0 h-full flex items-center justify-center bg-gray-500 text-white"
              style={{
                width: "80px",
                opacity: swipeState.x / 80,
                transition: "opacity 0.2s ease",
              }}
              onClick={() => handleDelete(_id)}
            >
              <TrashIcon
                className="w-4 h-4"
                style={{
                  transform: `scale(${0.5 + (swipeState.x / 80) * 0.5})`,
                  transition: "transform 0.2s ease",
                }}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
}
