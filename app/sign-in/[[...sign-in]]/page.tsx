"use client";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen text-left">
      <SignInButton
        mode="modal"
        fallbackRedirectUrl={"/"}
        signUpForceRedirectUrl={"/"}
      >
        <Button
          className="p-2 flex flex-col"
          style={{
            fontFamily: "Arial",
          }}
        >
          <Image
            src="/favicon.svg"
            alt="milk"
            width={100}
            height={100}
            className="z-10"
          />
          <p className="text-xs">[sign in why don&apos;t you] </p>
        </Button>
      </SignInButton>
    </div>
  );
}
