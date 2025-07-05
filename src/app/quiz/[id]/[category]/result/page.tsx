
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Home, RefreshCw } from 'lucide-react';


import { QA } from '@/lib/types';

interface QuizResults {
  total: number;
  correct: number;
  answers: Record<number, { knewIt: boolean }>;
  questions: QA[]; // 전체 문제 목록
}

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const { id, category } = params;

  const [results, setResults] = useState<QuizResults | null>(null);

  useEffect(() => {
    const storedResults = localStorage.getItem('quizResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
  }, []);

  if (!results) {
    return <div>Loading results...</div>;
  }

  const { total, correct, questions, answers } = results;
  const wrong = total - correct;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  const handleRetryWrong = () => {
    const wrongQuestions = results.questions.filter(
      (_, index) => !results.answers[index]?.knewIt
    );
    // 오답 목록을 localStorage에 저장하여 퀴즈 페이지로 전달
    localStorage.setItem('retryQuizQuestions', JSON.stringify(wrongQuestions));
    router.push(`/quiz/${id}/retry`);
  };

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
