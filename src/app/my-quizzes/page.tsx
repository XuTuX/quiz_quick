'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Quiz } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

export default function MyQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quizzes/my-quizzes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQuizzes(data.quizzes);
    } catch (err: any) {
      setError(err.message);
      toast.error(`퀴즈를 불러오는 데 실패했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 퀴즈를 삭제하시겠습니까?')) {
      return;
    }
    try {
      const response = await fetch(`/api/quizzes/${id}/delete`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
      toast.success('퀴즈가 성공적으로 삭제되었습니다.');
    } catch (err: any) {
      toast.error(`퀴즈 삭제에 실패했습니다: ${err.message}`);
    }
  };

  const handleToggleShare = async (id: string, currentIsShared: boolean) => {
    try {
      const response = await fetch(`/api/quizzes/${id}/toggle-visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isShared: !currentIsShared }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedQuiz = await response.json();
      setQuizzes(quizzes.map((quiz) => (quiz.id === id ? updatedQuiz.quiz : quiz)));
      toast.success(`퀴즈가 ${!currentIsShared ? '공유' : '비공개'}되었습니다.`);
    } catch (err: any) {
      toast.error(`공유 상태 변경에 실패했습니다: ${err.message}`);
    }
  };

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
        <p>아직 생성된 퀴즈가 없습니다. 새 퀴즈를 만들어보세요!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>
                  생성일: {new Date(quiz.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`share-switch-${quiz.id}`}
                    checked={quiz.isShared}
                    onCheckedChange={() => handleToggleShare(quiz.id, quiz.isShared)}
                  />
                  <Label htmlFor={`share-switch-${quiz.id}`}>
                    {quiz.isShared ? '공유됨' : '비공개'}
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/quiz/${quiz.id}`}>
                  <Button variant="outline">퀴즈 풀기</Button>
                </Link>
                <Button variant="destructive" onClick={() => handleDelete(quiz.id)}>
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
