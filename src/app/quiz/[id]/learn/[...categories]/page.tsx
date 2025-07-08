'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QA, QuizData } from '@/lib/types';
import { Home } from 'lucide-react';
import Link from 'next/link';

async function getQuizData(id: string): Promise<QuizData | null> {
    const res = await fetch(`/api/quizzes/${id}`);
    if (!res.ok) {
        return null;
    }
    const data = await res.json();
    return data.quiz.quizData;
}

export default function LearnPage() {
    const params = useParams() as { id: string; categories: string[] };
    const { id, categories } = params;

    const cats = useMemo(() => {
        return categories.map(decodeURIComponent);
    }, [categories]);

    const [questions, setQuestions] = useState<QA[]>([]);
    const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<number | null>(null);

    useEffect(() => {
        if (typeof id === 'string') {
            getQuizData(id).then(data => {
                if (data) {
                    let questionSet: QA[] = [];
                    cats.forEach(cat => {
                        if (data[cat]) {
                            questionSet = questionSet.concat(data[cat]);
                        }
                    });
                    setQuestions(questionSet);
                }
            });
        }
    }, [id, cats]);

    const toggleAnswer = (index: number) => {
        setExpandedQuestionIndex(expandedQuestionIndex === index ? null : index);
    };

    if (questions.length === 0) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-2xl text-center">
                    <CardHeader>
                        <CardTitle>문제 로딩 중...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>선택한 카테고리에 해당하는 문제가 없습니다.</p>
                        <Link href={`/quiz/${id}`} className="mt-4 inline-block text-blue-600 hover:underline">
                            <Home className="inline-block mr-2 h-4 w-4" />
                            카테고리 선택으로 돌아가기
                        </Link>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <Card className="w-full max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">학습하기: {cats.join(' · ')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {questions.map((qa, index) => (
                            <div
                                key={index}
                                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => toggleAnswer(index)}
                            >
                                <p className="font-semibold text-lg">Q{index + 1}. {qa.question}</p>
                                {expandedQuestionIndex === index && (
                                    <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-200">
                                        <p className="font-bold text-green-700">정답:</p>
                                        <p className="text-green-800">{qa.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 text-center">
                        <Link href={`/quiz/${id}`}>
                            <Button variant="outline">
                                <Home className="mr-2 h-4 w-4" />
                                카테고리 선택으로 돌아가기
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
