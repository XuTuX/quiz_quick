'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuizData, QA } from '@/lib/types';
import { ArrowRight, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuizSessionProps {
    initialQuizData: QuizData;
    onReset?: () => void; // onReset을 선택적으로 만듭니다.
}

type QuizPhase = 'learn' | 'done';

export default function QuizSession({ initialQuizData, onReset }: QuizSessionProps) {
    const router = useRouter();
    const allQuestions = useMemo(() => Object.values(initialQuizData).flat(), [initialQuizData]);

    const [quizPhase, setQuizPhase] = useState<QuizPhase>('learn');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState<QA[]>(allQuestions);
    const [showAnswer, setShowAnswer] = useState(false);
    // userAnswers 상태를 확장하여 주관식 문제의 '알아요/몰라요'를 저장
    const [userAnswers, setUserAnswers] = useState<Record<number, { selected?: string, isCorrect?: boolean, knewIt?: boolean }>>({});

    const currentQuestion = questions[currentQuestionIndex];
    const isMultipleChoice = !!currentQuestion.options && currentQuestion.options.length > 0;

    const handleOptionSelect = (option: string) => {
        if (showAnswer) return;
        setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], selected: option } }));
    };

    const handleCheckAnswer = () => {
        setShowAnswer(true);
        const selected = userAnswers[currentQuestionIndex]?.selected;
        const isCorrect = selected === currentQuestion.answer;
        setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], isCorrect } }));
    };

    const handleSelfAssess = (knew: boolean) => {
        setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], knewIt: knew, isCorrect: knew } }));
        goToNextQuestion();
    };

    const goToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setShowAnswer(false);
        } else {
            setQuizPhase('done');
        }
    };

    const retryWrongQuestions = () => {
        const wrongQuestions = questions.filter((_, index) => userAnswers[index]?.isCorrect === false);
        if (wrongQuestions.length > 0) {
            setQuestions(wrongQuestions);
            setCurrentQuestionIndex(0);
            setUserAnswers({});
            setShowAnswer(false);
            setQuizPhase('learn');
        }
    };

    const getOptionClasses = (option: string) => {
        const selected = userAnswers[currentQuestionIndex]?.selected;
        if (!showAnswer) return selected === option ? 'bg-blue-200' : 'bg-gray-100 hover:bg-gray-200';
        if (option === currentQuestion.answer) return 'bg-green-200 border-green-500';
        if (selected === option && selected !== currentQuestion.answer) return 'bg-red-200 border-red-500';
        return 'bg-gray-100';
    };

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (quizPhase !== 'learn' || !currentQuestion) return;
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            if (showAnswer) goToNextQuestion();
            else if (isMultipleChoice) handleCheckAnswer();
            else setShowAnswer(true);
        } else if (event.key === 'ArrowRight' && showAnswer) goToNextQuestion();
    }, [showAnswer, goToNextQuestion, handleCheckAnswer, quizPhase, isMultipleChoice, currentQuestion]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);


    if (quizPhase === 'done') {
        const correctCount = Object.values(userAnswers).filter(ans => ans.isCorrect).length;
        const totalCount = questions.length;
        const wrongCount = totalCount - correctCount;

        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader><CardTitle>퀴즈 완료!</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-xl">총 {totalCount}문제 중 <span className="font-bold text-green-600">{correctCount}개</span> 맞았습니다!</p>
                        {wrongCount > 0 && <p className="text-lg mt-2">틀린 문제: <span className="font-bold text-red-600">{wrongCount}개</span></p>}
                        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                            {wrongCount > 0 && (<Button onClick={retryWrongQuestions} className="flex-1"><RefreshCw className="mr-2 h-4 w-4" />오답 다시 풀기</Button>)}
                            <Button onClick={onReset || (() => router.push('/'))} variant="outline" className="flex-1"><Home className="mr-2 h-4 w-4" />처음으로</Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>AI 생성 퀴즈</CardTitle>
                        <span className="text-sm text-muted-foreground">문제 {currentQuestionIndex + 1} / {questions.length}</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-lg font-semibold">{currentQuestion.question}</p>
                    <div className="space-y-3">
                        {isMultipleChoice ? (
                            currentQuestion.options!.map((option, index) => (
                                <Button key={index} variant="outline" className={'w-full justify-start h-auto p-4 text-left whitespace-normal ' + getOptionClasses(option)} onClick={() => handleOptionSelect(option)} disabled={showAnswer}>{option}</Button>
                            ))
                        ) : (
                            showAnswer ? (
                                <div className="p-4 bg-green-100 border rounded-md">
                                    <p className="font-bold">정답:</p>
                                    <p>{currentQuestion.answer}</p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">주관식 문제입니다. 정답을 확인해보세요.</p>
                            )
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Button variant="ghost" onClick={onReset || (() => router.push('/'))}><Home className="mr-2 h-4 w-4" />처음으로</Button>
                    <div className="flex gap-4">
                        {!isMultipleChoice && !showAnswer && <Button onClick={() => setShowAnswer(true)}>정답 보기</Button>}
                        {!isMultipleChoice && showAnswer && (
                            <>
                                <Button onClick={() => handleSelfAssess(true)}>알아요</Button>
                                <Button variant="destructive" onClick={() => handleSelfAssess(false)}>몰라요</Button>
                            </>
                        )}
                        {isMultipleChoice && !showAnswer && <Button onClick={handleCheckAnswer} disabled={!userAnswers[currentQuestionIndex]?.selected}>정답 확인</Button>}
                        {isMultipleChoice && showAnswer && <Button onClick={goToNextQuestion}>다음 문제 <ArrowRight className="ml-2 h-4 w-4" /></Button>}
                    </div>
                </CardFooter>
            </Card>
        </main>
    );
}