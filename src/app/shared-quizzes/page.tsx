'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

/* 1️⃣ totalLikes 포함시킨 타입 */
interface SharedQuiz {
  id: string;
  title: string;
  createdAt: string;
  hashtags: string[];
  totalLikes: number;     // ← 추가
}

function SharedQuizzesContent() {
  const query = useSearchParams().get('q') || '';

  const [quizzes, setQuizzes] = useState<SharedQuiz[]>([]);
  const [allHashtags, setAllHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ------------- 데이터 로드 ------------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/quizzes/shared?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setQuizzes(data.quizzes);          // totalLikes 포함
      } catch (e: any) {
        setError(e.message);
        toast.error(`공유 퀴즈 불러오기 실패: ${e.message}`);
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      try {
        const res = await fetch('/api/hashtags');
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setAllHashtags(data.hashtags);
      } catch (e: any) {
        toast.error(`해시태그 불러오기 실패: ${e.message}`);
      }
    })();
  }, [query]);

  if (loading) return <div className="text-center p-4">검색 중...</div>;
  if (error) return <div className="text-center p-4 text-red-500">오류: {error}</div>;

  /* ------------- 렌더링 ------------- */
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">
        공유 퀴즈 탐색
        {query && <span className="text-purple-600">: “{query}”</span>}
      </h1>

      {/* 인기 해시태그 */}
      {allHashtags.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">인기 해시태그</h2>
          <div className="flex flex-wrap gap-2">
            {allHashtags.map((tag) => (
              <Link key={tag} href={`/shared-quizzes?q=${encodeURIComponent(tag)}`}>
                <Badge
                  variant={query === tag ? 'default' : 'secondary'}
                  className="cursor-pointer"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
            {query && (
              <Link href="/shared-quizzes">
                <Button variant="outline" size="sm">모두 보기</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 퀴즈 카드 */}
      {quizzes.length === 0 ? (
        <p>검색 결과가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                {/* 2️⃣ 제목 - 좋아요 개수 표시 */}
                <div className="flex items-center justify-between">
                  <CardTitle>{quiz.title}</CardTitle>

                  <div className="flex items-center gap-1 text-grey-500">
                    {/* SVG 하트 아이콘 - 패키지 없어도 됨 */}
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
              </CardHeader>

              <CardContent>
                {quiz.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {quiz.hashtags.map((tag) => (
                      <Link key={tag} href={`/shared-quizzes?q=${encodeURIComponent(tag)}`}>
                        <Badge variant="secondary" className="cursor-pointer">
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
