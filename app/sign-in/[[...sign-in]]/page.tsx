"use client";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";
import { TransparencyGridIcon } from "@radix-ui/react-icons";
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
          className="p-1 flex flex-col items-start"
          style={{
            fontFamily: "Arial",
          }}
        >
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

          <p className="text-xs">[sign in why don&apos;t you] </p>
        </Button>
      </SignInButton>
    </div>
  );
}
