"use client";

import {
  EnvelopeClosedIcon,
  GitHubLogoIcon,
  TransparencyGridIcon,
  FaceIcon,
  CursorArrowIcon,
} from "@radix-ui/react-icons";
import { useAuthActions } from "@convex-dev/auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";

const REDIRECT_TO = "/";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();

  const handleGitHubSignIn = () =>
    signIn("github", { redirectTo: REDIRECT_TO });

  const handleMagicLinkSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("redirectTo", REDIRECT_TO);

    try {
      await signIn("resend", formData);
      toast({ title: "sign-in link sent! check ur email" });
    } catch (error) {
      console.error(error);
      toast({
        title: "could not send sign-in link :(",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen text-left big">
      <div className="flex flex-col w-full max-w-md gap-8">
        <div className="flex flex-col gap-2 p-4">
          <p className="flex gap-1 items-center">
            sign in <FaceIcon /> <CursorArrowIcon />
          </p>

          <div className="flex items-center gap-2">
            via
            <Button onClick={handleGitHubSignIn}>
              [<GitHubLogoIcon className="mx-1" /> github]
            </Button>
          </div>

          <div className="flex items-center gap-2">
            or receive a<br />
            magic sign-on link <TransparencyGridIcon className="mx-1" />
          </div>

          <form
            className="flex items-center gap-4 mt-4"
            onSubmit={handleMagicLinkSubmit}
          >
            <Input
              name="email"
              id="email"
              placeholder="email@email.email"
              autoComplete="email"
            />
          </form>

          <Button type="submit">
            [send <EnvelopeClosedIcon className="ml-1" />]
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
