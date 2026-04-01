"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteCookie } from "@/lib/domain/server-functions/cookies";
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";
import { useAuth } from "../providers/authProvider";

async function logOut() {
  await deleteCookie("userId");
  await signOut(auth);
  location.reload();
}

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-f1-grid px-6">
      <span className="text-sm font-medium tracking-tight">Pit Lane Supply</span>
      <div className="flex items-center gap-4">
        <span className="max-w-[200px] truncate text-sm text-muted-foreground">
          {user.email ?? "—"}
        </span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              Log out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Log out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will need to sign in again to use your wish list and account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => void logOut()}>
                Log out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
