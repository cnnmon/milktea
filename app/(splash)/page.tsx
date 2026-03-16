"use client";

import { useState, useEffect, useTransition } from "react";
import Editor from "./Editor";
import { useRecentNotepads } from "@/hooks/useRecentNotepads";
import { useRouter } from "next/navigation";
import { Search, X, Cloud, CloudOff } from "lucide-react";
import { displayDate } from "@/convex/utils";
import { cleanupEmptyNotepads } from "@/lib/db";

export default function NewNotepadPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { notepads } = useRecentNotepads();
  const router = useRouter();
  const [loadingDate, setLoadingDate] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isSearching = searchQuery.length > 0;

  useEffect(() => {
    cleanupEmptyNotepads();
  }, []);

  const filteredNotepads = isSearching
    ? notepads.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleClick = (date: string) => {
    setLoadingDate(date);
    startTransition(() => {
      router.push(`/${date}`);
    });
  };

  const searchContent = (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="search journals..."
          className="w-full pl-8 pr-8 py-1.5 bg-transparent border-b border-gray-300 text-sm focus:outline-none focus:border-gray-500 smooth-transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      {isSearching && (
        <div className="flex flex-col gap-2 animate-in fade-in duration-300">
          {filteredNotepads.length === 0 ? (
            <p className="text-gray-400 text-xs">no results</p>
          ) : (
            filteredNotepads.map(({ date, title, syncStatus, tags }) => (
              <div
                key={date}
                onClick={() => handleClick(date)}
                className={`flex gap-2 justify-between items-center hover:bg-gray-300 cursor-pointer ${
                  loadingDate === date && isPending ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {loadingDate === date && isPending && (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  )}
                  <p className="medium">{title || "(untitled)"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {tags?.map((tag, i) => (
                    <p
                      key={`${tag}-${i}`}
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
            ))
          )}
        </div>
      )}
    </>
  );

  return (
    <Editor topContent={searchContent} hideBody={isSearching} />
  );
}
