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
    const [categories] = useState(Object.keys(initialQuizData));
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // (1) 절대 변하지 않는 전체 문제 리스트
    const [allQuestions] = useState<QA[]>(() =>
        Object.values(initialQuizData).flat(),
    );

    // (2) 현재 학습 중인 문제 세트 (오답 재도전 시 교체됨)
    const [questions, setQuestions] = useState<QA[]>([]);

    const [quizPhase, setQuizPhase] = useState<QuizPhase>('learn');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    // 문제 인덱스(항상 allQuestions 기준) ➜ 사용자의 답안 기록
    const [userAnswers, setUserAnswers] = useState<
        Record<number, UserAnswer>
    >({});

    // ⬇️ 컴포넌트 마운트 시 초기 문제 세트 설정
    useEffect(() => {
        if (!selectedCategory && allQuestions.length > 0) {
            setQuestions(allQuestions);
        }
    }, [allQuestions, selectedCategory]);

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

    const handleSelectCategory = (category: string | null) => {
        if (category) {
            setQuestions([...initialQuizData[category]]);
        } else {
            setQuestions([...allQuestions]);
        }
        setSelectedCategory(category);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setShowAnswer(false);
        setQuizPhase('learn');
    };

    // ⬇️ 오답만 모아서 재도전
    const retryWrongQuestions = () => {
        const wrong = allQuestions.filter(
            (_, idx) => userAnswers[idx]?.knewIt === false,
        );
        if (wrong.length) {
            setQuestions(wrong);
            setSelectedCategory("오답 노트"); // 오답노트 카테고리 지정
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
        const total = questions.length; // 현재 카테고리(또는 오답노트) 기준
        const wrong = total - correct;
        const score = total > 0 ? Math.round((correct / total) * 100) : 0; // 점수 계산

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
                        <p className="text-2xl font-bold mt-4">
                            점수: <span className="text-purple-600">{score}점</span>
                        </p>
                        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                            {wrong > 0 && (
                                <Button onClick={retryWrongQuestions} className="flex-1">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    오답 다시 풀기
                                </Button>
                            )}
                            <Button
                                onClick={() => setSelectedCategory(null)} // 카테고리 선택으로 돌아가기
                                variant="outline"
                                className="flex-1"
                            >
                                <Home className="mr-2 h-4 w-4" />
                                카테고리 선택
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        );
    }

    /* ------------------------------------------------------------------ */
    /*  5. 카테고리 선택 화면                                             */
    /* ------------------------------------------------------------------ */
    if (!selectedCategory) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">학습할 카테고리 선택</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                onClick={() => handleSelectCategory(cat)}
                                className="h-16 text-lg justify-between"
                                variant="outline"
                            >
                                <span>{cat}</span>
                                <span className="text-sm font-normal bg-gray-200 px-2 py-1 rounded">
                                    {initialQuizData[cat].length} 문제
                                </span>
                            </Button>
                        ))}
                        <Button
                            onClick={() => handleSelectCategory(null)} // 전체 문제 선택
                            className="h-16 text-lg justify-between md:col-span-2 bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            <span>전체 문제 풀기</span>
                            <span className="text-sm font-normal bg-blue-400 px-2 py-1 rounded">
                                {allQuestions.length} 문제
                            </span>
                        </Button>
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
                        <CardTitle>{selectedCategory === '오답 노트' ? '오답 다시 풀기' : selectedCategory || '전체 퀴즈'}</CardTitle>
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
                        onClick={() => setSelectedCategory(null)} // 카테고리 선택으로 돌아가기
                    >
                        <Home className="mr-2 h-4 w-4" />
                        카테고리 선택
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
