'use client';

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
    <header className="w-full px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 border-b">
        <Link href="/" className="font-bold text-2xl text-gray-800">
          QuizPick
        </Link>
        
        {/* 로그인 상태에 따라 다른 UI 렌더링 */}
        <div className="flex items-center gap-2">
          <SignedIn>
            <Button asChild variant="ghost">
              <Link href="/shared-quizzes">공유 퀴즈</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/my-quizzes">내 퀴즈</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/pricing">구독</Link>
            </Button>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <Button asChild>
              <Link href="/create-quiz">퀴즈 만들기</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Button asChild variant="secondary">
              <Link href="/pricing">구독</Link>
            </Button>
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