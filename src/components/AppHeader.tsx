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

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((res) => res.json());

export function AppHeader() {
  const { isSignedIn } = useUser();
  const { data, mutate } = useSWR(
    isSignedIn ? '/api/user/tickets' : null,
    fetcher
  );

  const ticketBalance = data?.ticketBalance ?? null;

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/user/profile">프로필 설정</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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