"use client";

import { ReactNode, useState } from "react";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransparencyGridIcon } from "@radix-ui/react-icons";
import Image from "next/image";

export function LocalAuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, login } = useLocalAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await login(password);

    if (!result.success) {
      setError(result.error || "Invalid password");
    }
    setSubmitting(false);
  };

  // Still checking auth state
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-400">loading...</div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
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

          <Button type="submit" disabled={submitting} className="hover-lift">
            {submitting ? "..." : "sign in, why don't you"}
          </Button>
        </form>
      </div>
    );
  }

  // Authenticated - show app
  return <>{children}</>;
}
