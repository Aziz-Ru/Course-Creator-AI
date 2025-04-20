"use client";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const SignOutButton = () => {
  return (
    <Dialog>
      <DialogTrigger className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-9 rounded px-4 py-2 has-[>svg]:px-3">
        Sign out
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            Select Sign out Button to sign out of your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={async () => {
              await signOut();
            }}
          >
            Sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignOutButton;
