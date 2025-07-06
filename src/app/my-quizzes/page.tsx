'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Quiz } from '@prisma/client';
import { QuizData } from '@/lib/types';

import { Button } from '@/components/ui/button';

import { toast } from 'react-hot-toast';

/* 1️⃣ totalLikes, questionCount 포함 타입 확장 */
interface MyQuiz extends Quiz {
  totalLikes: number;
  questionCount: number; // 퀴즈 문제 수 추가
}

export default function MyQuizzesPage() {
  const router = useRouter();
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
        <div className="grid grid-cols-1 gap-2">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="w-full border-b px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 cursor-pointer"
              onDoubleClick={() => router.push(`/quiz/${quiz.id}`)}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mb-2 md:mb-0">
                <span className="text-sm text-gray-500">{new Date(quiz.createdAt).toLocaleDateString()}</span>
                <span className="font-medium">{quiz.title}</span>
                <span className="text-sm text-gray-500">{quiz.questionCount} 문제</span>
                <span className="text-sm flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 fill-current text-red-500"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {quiz.totalLikes}
                </span>
                <span className="text-sm text-gray-500">
                  {quiz.isShared ? '공개' : '비공개'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleShare(quiz.id, quiz.isShared)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {quiz.isShared ? '비공개로 전환' : '공개로 전환'}
                </Button>
              </div>
              <div className="flex gap-2">
                <Link href={`/quiz/${quiz.id}`}>
                  <Button variant="outline" size="sm">풀기</Button>
                </Link>
                <Link href={`/edit-quiz/${quiz.id}`}>
                  <Button variant="secondary" size="sm">편집</Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(quiz.id)}
                >
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
