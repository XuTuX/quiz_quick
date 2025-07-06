'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Quiz } from '@prisma/client';
import { QuizData } from '@/lib/types';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

/* 1️⃣ totalLikes, questionCount 포함 타입 확장 */
interface MyQuiz extends Quiz {
  totalLikes: number;
  questionCount: number; // 퀴즈 문제 수 추가
}

export default function MyQuizzesPage() {
  const [quizzes, setQuizzes] = useState<MyQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* --------- 데이터 로드 --------- */
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/quizzes/my-quizzes');
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const quizzesWithQuestionCount = data.quizzes.map((quiz: Quiz) => {
        const quizData = quiz.quizData as unknown as QuizData;
        let totalQuestions = 0;
        for (const category in quizData) {
          totalQuestions += quizData[category].length;
        }
        return { ...quiz, questionCount: totalQuestions };
      });
      setQuizzes(quizzesWithQuestionCount);
    } catch (e: any) {
      setError(e.message);
      toast.error(`퀴즈 불러오기 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  /* --------- 삭제 & 공유 토글 --------- */
  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 퀴즈를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/quizzes/${id}/delete`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`${res.status}`);
      setQuizzes((qs) => qs.filter((q) => q.id !== id));
      toast.success('삭제되었습니다.');
    } catch (e: any) {
      toast.error(`삭제 실패: ${e.message}`);
    }
  };

  const handleToggleShare = async (id: string, isShared: boolean) => {
    try {
      const res = await fetch(`/api/quizzes/${id}/toggle-visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isShared: !isShared }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const { quiz: updated } = await res.json();
      setQuizzes((qs) => qs.map((q) => (q.id === id ? updated : q)));
      toast.success(!isShared ? '공유됨' : '비공개됨');
    } catch (e: any) {
      toast.error(`변경 실패: ${e.message}`);
    }
  };

  /* --------- 렌더링 --------- */
  if (loading) return <div className="container mx-auto p-4">로딩 중...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">오류: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">내 퀴즈</h1>

      <div className="mb-6">
        <Link href="/create-quiz">
          <Button>새 퀴즈 만들기</Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <p>아직 생성된 퀴즈가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                {/* 2️⃣ 제목 + 좋아요 개수(회색) */}
                <div className="flex items-center justify-between">
                  <CardTitle>{quiz.title}</CardTitle>

                  <div className="flex items-center gap-1 text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="text-sm">{quiz.totalLikes}</span>
                  </div>
                </div>

                <CardDescription>
                  생성일: {new Date(quiz.createdAt).toLocaleDateString()}
                </CardDescription>
                <CardDescription>
                  문제 수: {quiz.questionCount}개
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`share-${quiz.id}`}
                    checked={quiz.isShared}
                    onCheckedChange={() => handleToggleShare(quiz.id, quiz.isShared)}
                  />
                  <Label htmlFor={`share-${quiz.id}`}>
                    {quiz.isShared ? '공유됨' : '비공개'}
                  </Label>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Link href={`/quiz/${quiz.id}`}>
                  <Button variant="outline">퀴즈 풀기</Button>
                </Link>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(quiz.id)}
                >
                  삭제
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
