"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Name } from "./Name";
import { List } from "./List";
import { Header } from "@/components/Header";
import { PlusIcon } from "@radix-ui/react-icons";

export default function SplashPage() {
  const router = useRouter();
  const notepads = useQuery(api.notepads.get);
  const viewer = useQuery(api.users.viewer);

  return (
    <>
      <Header
        left={<Name viewer={viewer} />}
        right={
          <Button onClick={() => router.push("/notepad/new")}>
            <PlusIcon className="w-6 h-6" />
          </Button>
        }
      />
      <div className="flex flex-col gap-1 pt-[50%] pb-10">
        <List
          notepads={notepads}
          onClick={(id) => router.push(`/notepad/${id}`)}
        />
      </div>
    </>
  );
}
