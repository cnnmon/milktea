"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransparencyGridIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Invalid password");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen text-left">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <div className="flex w-full justify-center">
            <TransparencyGridIcon className="w-6 h-6 mr-[-18px]" />
            <Image
              src="/favicon.svg"
              alt="milk"
              width={100}
              height={100}
              className="z-10"
            />
          </div>
        </div>

        <Input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-48 text-center"
          autoFocus
        />

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <Button type="submit" disabled={loading} className="hover-lift">
          {loading ? "..." : "sign in"}
        </Button>
      </form>
    </div>
  );
}
