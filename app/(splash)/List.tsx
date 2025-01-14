"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export function List({ onClick }: { onClick?: (id: string) => void }) {
  const notepads = useQuery(api.notepads.get);

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
      {notepads.map(({ _id, title, date, tags }) => (
        <div
          key={_id}
          className="flex gap-2 justify-between items-center hover:bg-gray-300 cursor-pointer"
          onClick={() => onClick?.(_id)}
        >
          <p className="medium w-[85%]">{title}</p>
          <div className="flex w-[15%] gap-2 items-center justify-end">
            {tags.length ? (
              <div className="flex gap-2">
                {tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="bg-gray-300 px-1">
                    {tag}
                  </span>
                ))}
                {tags.length > 2 && (
                  <span className="bg-gray-300 px-1" title={tags.join(", ")}>
                    ...
                  </span>
                )}
              </div>
            ) : null}
            <p className="small text-right text-gray-500">
              {new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
