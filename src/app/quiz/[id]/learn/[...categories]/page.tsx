'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { QA, QuizData } from '@/lib/types';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getQuizData(id: string): Promise<QuizData | null> {
    const res = await fetch(`/api/quizzes/${id}`);
    return res.ok ? (await res.json()).quiz.quizData : null;
}

export default function LearnPage() {
    const params = useParams() as { id: string; categories: string[] };
    const { id, categories } = params;

    // URL-encoded 카테고리 디코딩
    const cats = useMemo(() => categories.map(decodeURIComponent), [categories]);

    const [questionsByCategory, setQuestionsByCategory] = useState<Record<string, QA[]>>({});

    useEffect(() => {
        if (typeof id !== 'string') return;

        getQuizData(id).then((data) => {
            if (!data) return;
            const grouped: Record<string, QA[]> = {};
            if (cats.includes('all')) {
                Object.keys(data).forEach((cat) => {
                    if (data[cat]) {
                        grouped[cat] = [...data[cat]];
                    }
                });
            } else {
                cats.forEach((cat) => {
                    if (data[cat]) {
                        grouped[cat] = [...data[cat]];
                    }
                });
            }
            setQuestionsByCategory(grouped);
        });
    }, [id, cats]);

    const totalQuestions = Object.values(questionsByCategory).reduce(
        (acc, q) => acc + q.length,
        0,
    );

    /* ────────────────────────────────────────────────────────── */
    /*                         RENDERING                          */
    /* ────────────────────────────────────────────────────────── */

    if (totalQuestions === 0) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md text-center">
                    <h2 className="mb-2 text-xl font-semibold">문제 로딩 중...</h2>
                    <p className="text-gray-600">선택한 카테고리에 해당하는 문제가 없습니다.</p>
                    <Link
                        href={`/quiz/${id}`}
                        className="mt-4 inline-flex items-center text-blue-600 hover:underline"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        카테고리 선택으로 돌아가기
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="mx-auto mb-6 w-full max-w-3xl">
                {/* ───────────────── Header 버튼 ───────────────── */}
                <Link href={`/quiz/${id}`}>
                    <Button variant="outline" className="mb-6">
                        <Home className="mr-2 h-4 w-4" />
                        카테고리 선택으로 돌아가기
                    </Button>
                </Link>

                <h1 className="mb-8 text-2xl font-bold">학습하기: {cats.join(' · ')}</h1>

                {/* ──────────────── 카테고리별 질문 ──────────────── */}
                {Object.entries(questionsByCategory).map(([catName, qaList]) => (
                    <section key={catName} className="mb-10">
                        <h3 className="mb-4 border-b pb-2 text-xl font-semibold">
                            {catName} <span className="text-base text-gray-500">({qaList.length}문제)</span>
                        </h3>

                        <div className="space-y-4">
                            {qaList.map((qa, idx) => (
                                <details
                                    key={idx}
                                    className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all open:bg-gray-50"
                                >
                                    <summary className="cursor-pointer select-none list-none p-4 text-sm font-medium leading-relaxed">
                                        Q{idx + 1}. {qa.question}
                                    </summary>

                                    <div className="border-t p-4 text-sm leading-relaxed">
                                        <p>
                                            <span className="font-semibold text-green-700">정답&nbsp;:&nbsp;</span>
                                            {qa.answer}
                                        </p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </main>
    );
}