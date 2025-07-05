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
  const [allHashtags, setAllHashtags] = useState<string[]>([]); // 모든 해시태그 상태 추가
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

    const fetchHashtags = async () => {
      try {
        const response = await fetch('/api/hashtags');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllHashtags(data.hashtags);
      } catch (err: any) {
        console.error("Failed to fetch hashtags:", err);
        toast.error(`해시태그를 불러오는 데 실패했습니다: ${err.message}`);
      }
    };

    fetchSharedQuizzes();
    fetchHashtags(); // 해시태그 불러오기
  }, [query]);

  if (loading) return <div className="text-center p-4">검색 중...</div>;
  if (error) return <div className="text-center p-4 text-red-500">오류: {error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">
        공유 퀴즈 탐색 {query && <span className="text-purple-600">: &quot;{query}&quot;</span>}
      </h1>

      {/* 해시태그 목록 표시 */}
      {allHashtags.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">인기 해시태그</h2>
          <div className="flex flex-wrap gap-2">
            {allHashtags.map((tag, index) => (
              <Link key={index} href={`/shared-quizzes?q=${encodeURIComponent(tag)}`}>
                <Badge 
                  variant={query === tag ? "default" : "secondary"} 
                  className="cursor-pointer hover:bg-gray-200"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
            {query && ( // 현재 필터링 중인 해시태그가 있을 경우 "모두 보기" 버튼 추가
              <Link href="/shared-quizzes">
                <Button variant="outline" size="sm">모두 보기</Button>
              </Link>
            )}
          </div>
        </div>
      )}

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
                          #{tag}
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