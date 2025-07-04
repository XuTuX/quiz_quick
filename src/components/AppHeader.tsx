"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
} from "@clerk/nextjs";
import { Brain, Sparkles, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Quiz {
    id: string;
    title: string;
}

export default function AppHeader() {
    const pathname = usePathname();

    /* --------- 검색 상태 --------- */
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Quiz[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            if (!query.trim()) return setResults([]);

            fetch(`/api/quizzes/shared?query=${encodeURIComponent(query.trim())}`)
                .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
                .then((d) => setResults(d.quizzes))
                .catch((e) => setError(String(e)));
        }, 400);

        return () => clearTimeout(t);
    }, [query]);

    return (
        <header
            className="sticky top-4 z-50 mx-4"
            role="banner"
            aria-label="사이트 헤더"
        >
            <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg">
                <div className="flex h-16 items-center gap-6 px-6">
                    {/* Brand (left) */}
                    <Link href="/" className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 bg-purple-700 rounded-xl flex items-center justify-center"
                            role="img"
                            aria-label="로고"
                        >
                            <Brain className="h-6 w-6 text-white" />
                        </div>

                        <span className="font-bold text-lg text-gray-900 hidden sm:inline">
                            <span className="text-purple-600">Quiz</span>
                            <span className="text-pink-500">Pick</span>
                        </span>
                    </Link>

                    {/* Search (center) */}
                    <div className="relative flex-1 flex justify-center">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="퀴즈 검색…"
                                className="pl-10 pr-3 h-9 rounded-xl bg-gray-50 border border-gray-300 focus-visible:ring-2 focus-visible:ring-purple-600"
                            />
                            {/* dropdown results */}
                            {query.trim() && (
                                <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                                    {results.length === 0 && (
                                        <li className="px-4 py-2 text-sm text-gray-500">
                                            {error ? `오류: ${error}` : "검색 결과가 없습니다."}
                                        </li>
                                    )}
                                    {results.map((q) => (
                                        <li key={q.id}>
                                            <Link
                                                href={`/quiz/${q.id}`}
                                                className="block px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 truncate"
                                                onClick={() => setQuery("")}
                                            >
                                                {q.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Actions (right) */}
                    <nav className="flex items-center gap-3 flex-none">
                        <SignedIn>
                            <>
                                <Button
                                    asChild
                                    className="rounded-xl bg-purple-700 hover:bg-purple-800 focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 text-white px-4 h-10 font-medium"
                                >
                                    <Link href="/create-quiz">
                                        <Plus className="h-4 w-4 mr-1" /> 새 퀴즈
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    className="rounded-xl bg-gray-200 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 text-gray-800 px-4 h-10 font-medium"
                                >
                                    <Link href="/my-quizzes">
                                        나의 페이지
                                    </Link>
                                </Button>
                                <UserButton afterSignOutUrl="/" />
                            </>
                        </SignedIn>

                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white h-9 px-4">
                                    로그인
                                </Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button
                                    variant="outline"
                                    className="h-9 rounded-xl border-2 border-gray-300"
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
