'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Quiz } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

import { Badge } from "@/components/ui/badge";

function SharedQuizzesContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedQuizzes = async () => {
      try {
        setLoading(true);
        const url = `/api/quizzes/shared?q=${encodeURIComponent(query)}`;
        const response = await fetch(url);
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
  }, [query]);

  if (loading) return <div className="text-center p-4">검색 중...</div>;
  if (error) return <div className="text-center p-4 text-red-500">오류: {error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">
        검색 결과 {query && <span className="text-purple-600">: &quot;{query}&quot;</span>}
      </h1>
      {quizzes.length === 0 ? (
        <p>검색 결과에 해당하는 공유 퀴즈가 없습니다.</p>
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
                {quiz.hashtags && quiz.hashtags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quiz.hashtags.map((tag, index) => (
                      <Link key={index} href={`/shared-quizzes?q=${encodeURIComponent(tag)}`}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
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

export default function SharedQuizzesPage() {
  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<div>로딩 중...</div>}>
        <SharedQuizzesContent />
      </Suspense>
    </div>
  );
}
