// /Users/kik/next_project/quizpick/src/app/quiz/[id]/[...categories]/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QA, QuizData } from '@/lib/types';
import { Home, RefreshCw } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// Interface for quiz results
interface QuizResults {
  total: number;
  correct: number;
  answers: Record<number, { knewIt: boolean }>;
  questions: QA[];
}

async function getQuizData(id: string): Promise<QuizData | null> {
    const res = await fetch(`/api/quizzes/${id}`);
    if (!res.ok) {
        return null;
    }
    const data = await res.json();
    return data.quiz.quizData;
}

export default function QuizPage() {
    const router = useRouter();
    const params = useParams() as { id: string; categories?: string[] };
    const { id, categories } = params;

    const cats = useMemo(() => {
        return (categories && categories.length > 0)
            ? categories.map(decodeURIComponent)
            : ['all'];
    }, [categories]);

    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [questions, setQuestions] = useState<QA[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [userAnswers, setUserAnswers] = useState<Record<number, { knewIt: boolean }>>({});
    const [showResult, setShowResult] = useState(false); // New state for showing results
    const [results, setResults] = useState<QuizResults | null>(null); // New state for results

    useEffect(() => {
        const isRetryMode = cats.includes('retry');
        const isResultMode = cats[cats.length - 1] === 'result'; // Check if the last segment is 'result'

        if (isResultMode) {
            const storedResults = localStorage.getItem('quizResults');
            if (storedResults) {
                setResults(JSON.parse(storedResults));
                setShowResult(true); // Show results if in result mode
            } else {
                // If no stored results, redirect to the quiz start
                router.replace(`/quiz/${id}`);
            }
        } else if (isRetryMode) {
            const retryQuestions = localStorage.getItem('retryQuizQuestions');
            if (retryQuestions) {
                setQuestions(JSON.parse(retryQuestions));
                setQuizData({});
            } else {
                router.replace(`/quiz/${id}`);
            }
        } else if (typeof id === 'string') {
            getQuizData(id).then(data => {
                if (data) {
                    setQuizData(data);
                    let questionSet: QA[] = [];
                    if (cats.includes('all')) {
                        questionSet = Object.values(data).flat();
                    } else {
                        questionSet = cats.flatMap(cat => data[cat] || []);
                    }
                    setQuestions(questionSet);
                }
            });
        }
    }, [id, cats, router]);

    const handleShowAnswer = () => setShowAnswer(true);

    const goToNextQuestion = () => {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowAnswer(false);
    };

    const handleSelfAssess = useCallback((knewIt: boolean) => {
        const updatedAnswers = { ...userAnswers, [currentQuestionIndex]: { knewIt } };
        setUserAnswers(updatedAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            goToNextQuestion();
        } else {
            const correctAnswers = Object.values(updatedAnswers).filter(a => a.knewIt).length;

            const finalResults = {
                total: questions.length,
                correct: correctAnswers,
                answers: updatedAnswers,
                questions: questions,
            };

            localStorage.setItem('quizResults', JSON.stringify(finalResults));

            if (cats.includes('retry')) {
                localStorage.removeItem('retryQuizQuestions');
            }

            setResults(finalResults); // Set results state
            setShowResult(true); // Show results instead of navigating
        }
    }, [currentQuestionIndex, questions, userAnswers, cats, router, id]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (showAnswer) {
            if (e.key === 'ArrowLeft') handleSelfAssess(false);
            if (e.key === 'ArrowRight') handleSelfAssess(true);
        } else {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleShowAnswer();
            }
        }
    }, [showAnswer, handleSelfAssess]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleRetryWrong = () => {
        if (results) {
            const wrongQuestions = results.questions.filter(
                (_, index) => !results.answers[index]?.knewIt
            );
            localStorage.setItem('retryQuizQuestions', JSON.stringify(wrongQuestions));
            // Navigate to retry mode within the same page
            router.replace(`/quiz/${id}/retry`);
            // Reset state for new quiz
            setShowResult(false);
            setCurrentQuestionIndex(0);
            setUserAnswers({});
            setShowAnswer(false);
            setResults(null);
        }
    };

    if (showResult) {
        if (!results) {
            return <div>Loading results...</div>;
        }

        const { total, correct } = results;
        const wrong = total - correct;
        const score = total > 0 ? Math.round((correct / total) * 100) : 0;

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
                                <Button onClick={handleRetryWrong} className="flex-1">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    오답 다시 풀기
                                </Button>
                            )}
                            <Button asChild variant="outline" className="flex-1">
                                <Link href={`/quiz/${id}`}>
                                    <Home className="mr-2 h-4 w-4" />
                                    카테고리 선택
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        );
    }

    if (!quizData || questions.length === 0) {
        return <div>Loading...</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{cats.join(' · ')}</CardTitle>
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
