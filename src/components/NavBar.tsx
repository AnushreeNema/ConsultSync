"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import UserButton from "./UserButton";
import { Button } from "./ui/button";

export default function NavBar() {
  const session = useSession();
  const user = session.data?.user;

  return (
    <header className="sticky top-0 bg-background px-3 shadow-sm">
      <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3">
        {/* Logo and Home Button */}
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold">
            ConsultSync
          </Link>

          <Link
            href="/?tab=none"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Home
          </Link>
        </div>

        {/* User or Sign-in */}
        <div className="flex items-center gap-3">
          {user && <UserButton user={user} />}
          {!user && session.status !== "loading" && <SignInButton />}
        </div>
      </nav>
    </header>
  );
}

function SignInButton() {
  return <Button onClick={() => signIn()}>Sign in</Button>;
}
