"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
} from "@clerk/nextjs";
import { Brain, Sparkles, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const [query, setQuery] = useState("");

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        router.push(`/shared-quizzes?q=${encodeURIComponent(trimmedQuery)}`);
    };

    return (
        <header
            className="sticky top-4 z-50 mx-4"
            role="banner"
            aria-label="사이트 헤더"
        >
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl">
                <div className="flex h-20 items-center gap-6 px-6">
                    {/* Brand (left) */}
                    <Link href="/" className="flex items-center gap-4">
                        <div
                            className="h-12 w-12 bg-purple-700 rounded-xl flex items-center justify-center"
                            role="img"
                            aria-label="로고"
                        >
                            <Brain className="h-7 w-7 text-white" />
                        </div>

                        <span className="font-bold text-xl text-gray-900 hidden sm:inline">
                            <span className="text-purple-600">Quiz</span>
                            <span className="text-pink-500">Pick</span>
                        </span>
                    </Link>

                    {/* Search (center) */}
                    <div className="relative flex-1 flex justify-center">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative w-full max-w-sm"
                        >
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="공유 퀴즈 검색…"
                                className="pl-10 pr-3 h-11 rounded-xl bg-gray-50 border border-gray-300 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1"
                            />
                            <button type="submit" className="sr-only">
                                검색
                            </button>
                        </form>
                    </div>

                    {/* Actions (right) */}
                    <nav className="flex items-center gap-3 flex-none">
                        <SignedIn>
                            <>
                                <Button
                                    asChild
                                    className="rounded-xl bg-purple-50 hover:bg-purple-100 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 text-purple-700 px-5 h-11 text-base"
                                >
                                    <Link href="/pricing">
                                        요금제
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    className="rounded-xl bg-purple-700 hover:bg-purple-800 focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 text-white px-5 h-11 text-base"
                                >
                                    <Link href="/create-quiz">
                                        <Plus className="h-4 w-4 mr-1" /> 새 퀴즈
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    className="rounded-xl bg-purple-50 hover:bg-purple-100 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 text-purple-700 px-5 h-11 text-base"
                                >
                                    <Link href="/my-quizzes">
                                        나의 페이지
                                    </Link>
                                </Button>
                                <UserButton afterSignOutUrl="/" />
                            </>
                        </SignedIn>

                        <SignedOut>
                            <Button
                                variant="outline"
                                className="h-10 rounded-xl border-2 border-gray-300 px-5 bg-purple-50 hover:bg-purple-100 text-purple-700 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                                asChild
                            >
                                <Link href="/pricing">
                                    요금제
                                </Link>
                            </Button>
                            <SignInButton mode="modal">
                                <Button className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white h-10 px-5">
                                    로그인
                                </Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button
                                    variant="outline"
                                    className="h-10 rounded-xl border-2 border-purple-300 px-5 text-purple-700"
                                >
                                    회원가입
                                </Button>
                            </SignUpButton>
                        </SignedOut>
                    </nav>
                </div>
            </div>
        </header>
    );
}