"use client";

import { TransparencyGridIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SignInPage() {
  const { signIn, isLoaded } = useSignIn();
  const { userId, getToken } = useAuth();
  const router = useRouter();
  const getUser = useQuery(api.users.getUser);
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (userId) {
      const handleUser = async () => {
        const email = await getToken();
        if (!email) return;

        const user = await getUser({ email });
        if (!user) {
          await createUser({ email });
        }

        router.push("/");
      };

      handleUser();
    }
  }, [userId, router, getUser, createUser, getToken]);

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen text-left">
      <Button
        onClick={handleGoogleSignIn}
        className="font-mondwest flex flex-col"
      >
        <div className="flex items-start">
          <Image
            src="/favicon.svg"
            alt="milk"
            width={100}
            height={100}
            className="z-10"
          />
          <TransparencyGridIcon className="absolute w-6 h-6" />
        </div>
        <span className="font-mondwest flex items-center w-[100px]">
          [sign in with google why don&apos;t you]
        </span>
      </Button>
    </div>
  );
}
