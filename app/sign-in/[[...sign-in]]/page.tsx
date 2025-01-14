"use client";

import {
  IdCardIcon,
  TransparencyGridIcon,
  FaceIcon,
  CursorArrowIcon,
} from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { toast } = useToast();
  const { signIn, isLoaded } = useSignIn();
  const { userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      router.push("/");
    }
  }, [userId, router]);

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen text-left big">
      <div className="flex flex-col w-full max-w-lg gap-8">
        <div className="flex flex-col gap-2 p-4">
          <p className="flex gap-1 items-center">
            sign in <FaceIcon className="w-6 h-6" />{" "}
            <CursorArrowIcon className="w-6 h-6" />
          </p>

          <div className="flex items-center gap-2">
            via
            <Button onClick={handleGoogleSignIn}>
              [
              <IdCardIcon className="mx-1 w-6 h-6" />
              google]
            </Button>
          </div>

          <TransparencyGridIcon className="mx-1 w-6 h-6" />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
