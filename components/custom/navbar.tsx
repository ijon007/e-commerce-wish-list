"use client";

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
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <span className="text-sm font-medium tracking-tight">Store</span>
      <div className="flex items-center gap-4">
        <span className="max-w-[200px] truncate text-sm text-muted-foreground">
          {user.email ?? "—"}
        </span>
        <Button variant="outline" size="sm" onClick={() => void logOut()}>
          Log out
        </Button>
      </div>
    </header>
  );
}
