'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QA, QuizData } from '@/lib/types';
import { Home } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

async function getQuizData(id: string): Promise<QuizData | null> {
    const res = await fetch(`/api/quizzes/${id}`);
    if (!res.ok) {
        return null;
    }
    const data = await res.json();
    return data.quizData;
}

export default function QuizPage() {
    const router = useRouter();
    const params = useParams();
    const { id, category: encodedCategory } = params;
    const category = decodeURIComponent(encodedCategory as string);

    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [questions, setQuestions] = useState<QA[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [userAnswers, setUserAnswers] = useState<Record<number, { knewIt: boolean }>>({});

    useEffect(() => {
        const isRetryMode = category === 'retry';

        if (isRetryMode) {
            const retryQuestions = localStorage.getItem('retryQuizQuestions');
            if (retryQuestions) {
                setQuestions(JSON.parse(retryQuestions));
                // 더미 데이터를 설정하여 로딩 화면을 통과시킵니다.
                setQuizData({});
            } else {
                // 재시도 데이터가 없으면 카테고리 선택으로 돌아갑니다.
                router.replace(`/quiz/${id}`);
            }
        } else if (typeof id === 'string') {
            // 일반 퀴즈 모드
            getQuizData(id).then(data => {
                if (data) {
                    setQuizData(data);
                    let questionSet: QA[];
                    if (category === 'all') {
                        questionSet = [...Object.values(data).flat()];
                    } else {
                        questionSet = [...(data[category] || [])];
                    }
                    setQuestions(questionSet);
                }
            });
        }
    }, [id, category, router]);

    const handleShowAnswer = () => setShowAnswer(true);

    const handleSelfAssess = (knewIt: boolean) => {
        setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: { knewIt } }));
        goToNextQuestion();
    };

    const goToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setShowAnswer(false);
        } else {
            // 마지막 문제 후 결과 계산
            const finalAnswers = { ...userAnswers, [currentQuestionIndex]: userAnswers[currentQuestionIndex] || { knewIt: false } };
            const correctAnswers = Object.values(finalAnswers).filter(a => a.knewIt).length;
            
            const results = {
                total: questions.length,
                correct: correctAnswers,
                answers: finalAnswers,
                questions: questions, // 현재 문제 세트 전달
            };

            localStorage.setItem('quizResults', JSON.stringify(results));
            
            // 재시도 세션이었다면, 사용된 재시도 데이터를 정리합니다.
            if (category === 'retry') {
                localStorage.removeItem('retryQuizQuestions');
            }

            router.push(`/quiz/${id}/${encodedCategory}/result`);
        }
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (showAnswer) {
            if (e.key === 'ArrowLeft') handleSelfAssess(false);
            if (e.key === 'ArrowRight') handleSelfAssess(true);
        } else {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleShowAnswer();
            }
        }
    }, [showAnswer, currentQuestionIndex]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!quizData || questions.length === 0) {
        return <div>Loading...</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{category}</CardTitle>
                        <span className="text-sm text-muted-foreground">
                            문제 {currentQuestionIndex + 1} / {questions.length}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-lg font-semibold">{currentQuestion.question}</p>
                    {showAnswer && (
                        <div className="p-4 bg-green-100 border rounded-md">
                            <p className="font-bold">정답:</p>
                            <p>{currentQuestion.answer}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Button variant="ghost" asChild>
                        <Link href={`/quiz/${id}`}>
                            <Home className="mr-2 h-4 w-4" />
                            카테고리 선택
                        </Link>
                    </Button>
                    <div className="flex gap-4">
                        {!showAnswer ? (
                            <Button onClick={handleShowAnswer}>정답 보기 (Space)</Button>
                        ) : (
                            <>
                                <Button variant="destructive" onClick={() => handleSelfAssess(false)}>
                                    몰라요 (←)
                                </Button>
                                <Button onClick={() => handleSelfAssess(true)}>
                                    알아요 (→)
                                </Button>
                            </>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </main>
    );
}