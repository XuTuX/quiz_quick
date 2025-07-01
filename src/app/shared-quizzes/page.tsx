'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Quiz } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

export default function SharedQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedQuizzes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/quizzes/shared');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQuizzes(data.quizzes);
      } catch (err: any) {
        setError(err.message);
        toast.error(`공유된 퀴즈를 불러오는 데 실패했습니다: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedQuizzes();
  }, []);

  if (loading) return <div className="container mx-auto p-4">로딩 중...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">오류: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">공유된 퀴즈</h1>
      {quizzes.length === 0 ? (
        <p>아직 공유된 퀴즈가 없습니다.</p>
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
                <p>이 퀴즈는 공유되어 있습니다.</p>
              </CardContent>
              <CardFooter>
                <Link href={`/quiz/${quiz.id}`}>
                  <Button>퀴즈 풀기</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
