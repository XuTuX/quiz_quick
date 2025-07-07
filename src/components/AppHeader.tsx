'use client';

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Ticket } from "lucide-react";

export function AppHeader() {
  const { isSignedIn } = useUser();
  const [ticketBalance, setTicketBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchTicketBalance = async () => {
      if (!isSignedIn) {
        setTicketBalance(null);
        return;
      }
      try {
        const res = await fetch('/api/user/tickets', {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch tickets: ${res.statusText}`);
        }
        const data = await res.json();
        setTicketBalance(data.ticketBalance);
      } catch (error) {
        console.error("Error fetching ticket balance in AppHeader:", error);
        setTicketBalance(0); // Fallback to 0 on error
      }
    };
    fetchTicketBalance();
  }, [isSignedIn]);

  return (
    <header className="w-full px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 border-b">
        <Link href="/" className="font-bold text-2xl text-gray-800">
          QuizPick
        </Link>
        
        {/* 로그인 상태에 따라 다른 UI 렌더링 */}
        <div className="flex items-center gap-2">
          <SignedIn>
            {ticketBalance !== null && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                <Ticket className="w-4 h-4 mr-1" /> 남은 티켓: {ticketBalance}개
              </span>
            )}
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