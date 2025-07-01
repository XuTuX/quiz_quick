'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuizData, QA } from '@/lib/types';
import { Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuizSessionProps {
    initialQuizData: QuizData;
    onReset?: () => void;
}

type QuizPhase = 'learn' | 'done';
type UserAnswer = { knewIt?: boolean };

export default function QuizSession({
    initialQuizData,
    onReset,
}: QuizSessionProps) {
    const router = useRouter();

    /* ------------------------------------------------------------------ */
    /*  1. 상태                                                           */
    /* ------------------------------------------------------------------ */
    // (1) 절대 변하지 않는 전체 문제 리스트
    const [allQuestions] = useState<QA[]>(() =>
        Object.values(initialQuizData).flat(),
    );

    // (2) 현재 학습 중인 문제 세트 (오답 재도전 시 교체됨)
    const [questions, setQuestions] = useState<QA[]>(allQuestions);

    const [quizPhase, setQuizPhase] = useState<QuizPhase>('learn');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    // 문제 인덱스(항상 allQuestions 기준) ➜ 사용자의 답안 기록
    const [userAnswers, setUserAnswers] = useState<
        Record<number, UserAnswer>
    >({});

    /* ------------------------------------------------------------------ */
    /*  2. 헬퍼                                                           */
    /* ------------------------------------------------------------------ */
    const currentQuestion = questions[currentQuestionIndex];

    const handleShowAnswer = () => setShowAnswer(true);

    const handleSelfAssess = (knew: boolean) => {
        setUserAnswers((prev) => ({
            ...prev,
            // ⬇️ 인덱스는 allQuestions 기준이라서
            [allQuestions.indexOf(currentQuestion)]: { knewIt: knew },
        }));
        goToNextQuestion();
    };

    const goToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setShowAnswer(false);
        } else {
            setQuizPhase('done');
        }
    };

    // ⬇️ 오답만 모아서 재도전
    const retryWrongQuestions = () => {
        const wrong = allQuestions.filter(
            (_, idx) => userAnswers[idx]?.knewIt === false,
        );
        if (wrong.length) {
            setQuestions(wrong);
            setCurrentQuestionIndex(0);
            setUserAnswers({});
            setShowAnswer(false);
            setQuizPhase('learn');
        }
    };

    /* ------------------------------------------------------------------ */
    /*  3. 키보드 단축키                                                  */
    /* ------------------------------------------------------------------ */
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (quizPhase !== 'learn') return;

            if (showAnswer) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    handleSelfAssess(false);
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    handleSelfAssess(true);
                }
            } else {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleShowAnswer();
                }
            }
        },
        [showAnswer, quizPhase, currentQuestion], // currentQuestion 의존성 추가
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown, { passive: false });
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    /* ------------------------------------------------------------------ */
    /*  4. 결과 화면                                                      */
    /* ------------------------------------------------------------------ */
    if (quizPhase === 'done') {
        const correct = Object.values(userAnswers).filter((a) => a.knewIt).length;
        const total = allQuestions.length; // 항상 원본 기준
        const wrong = total - correct;

        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <CardTitle>퀴즈 완료!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl">
                            총 {total}문제 중{' '}
                            <span className="font-bold text-green-600">{correct}개</span> 맞았습니다!
                        </p>
                        {wrong > 0 && (
                            <p className="text-lg mt-2">
                                틀린 문제: <span className="font-bold text-red-600">{wrong}개</span>
                            </p>
                        )}
                        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                            {wrong > 0 && (
                                <Button onClick={retryWrongQuestions} className="flex-1">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    오답 다시 풀기
                                </Button>
                            )}
                            <Button
                                onClick={onReset || (() => router.push('/'))}
                                variant="outline"
                                className="flex-1"
                            >
                                <Home className="mr-2 h-4 w-4" />
                                처음으로
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        );
    }

    /* ------------------------------------------------------------------ */
    /*  5. 학습 화면                                                      */
    /* ------------------------------------------------------------------ */
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>AI 생성 퀴즈</CardTitle>
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
                    <Button
                        variant="ghost"
                        onClick={onReset || (() => router.push('/'))}
                    >
                        <Home className="mr-2 h-4 w-4" />
                        처음으로
                    </Button>

                    <div className="flex gap-4">
                        {!showAnswer && (
                            <Button onClick={handleShowAnswer}>정답 보기 (Space)</Button>
                        )}
                        {showAnswer && (
                            <>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleSelfAssess(false)}
                                >
                                    몰라요&nbsp;(←)
                                </Button>
                                <Button onClick={() => handleSelfAssess(true)}>
                                    알아요&nbsp;(→)
                                </Button>
                            </>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </main>
    );
}
