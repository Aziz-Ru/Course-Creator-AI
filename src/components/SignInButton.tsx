"use client";
import { signIn } from "next-auth/react";
import { Button } from "./ui/button";

const SignInButton = () => {
  return (
    <Button
      variant={"ghost"}
      onClick={async () => {
        await signIn("google");
      }}
    >
      Sign in
    </Button>
  );
};

export default SignInButton;
