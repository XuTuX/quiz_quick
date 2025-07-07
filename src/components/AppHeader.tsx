"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="w-full px-4 sm:px-6 lg:px-8 bg-white">
      <div className="flex items-center justify-between h-16 border-b">
        <Link href="/" className="font-bold text-2xl text-gray-800">
          QuizPick
        </Link>
        <div className="flex items-center gap-4">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost">로그인</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>회원가입</Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
