'use client';

import { useEffect, useState, Suspense, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { QuizData } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { Heart, MessageSquare, Search, Play } from 'lucide-react';

interface SharedQuiz {
  id: string;
  title: string;
  createdAt: string;
  hashtags: string[];
  totalLikes: number;
  quizData: any;
  questionCount: number;
}

function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/shared-quizzes?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-xl mx-auto mb-4">
      <Input
        type="search"
        placeholder="퀴즈 제목 또는 해시태그로 검색..."
        className="rounded-r-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button type="submit" className="rounded-l-none">
        <Search className="w-4 h-4" />
      </Button>
    </form>
  );
}

function SharedQuizzesContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const router = useRouter();

  const [quizzes, setQuizzes] = useState<SharedQuiz[]>([]);
  const [allHashtags, setAllHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzesAndHashtags = async () => {
      try {
        setLoading(true);
        const [quizRes, hashtagRes] = await Promise.all([
          fetch(`/api/quizzes/shared?q=${encodeURIComponent(query)}`),
          fetch('/api/hashtags')
        ]);

        if (!quizRes.ok) throw new Error(`퀴즈 로딩 실패: ${quizRes.status}`);
        const quizData = await quizRes.json();
        const quizzesWithQuestionCount = quizData.quizzes.map((quiz: any) => {
          const qd = quiz.quizData as QuizData;
          let totalQuestions = 0;
          for (const category in qd) {
            totalQuestions += qd[category].length;
          }
          return { ...quiz, questionCount: totalQuestions };
        });
        setQuizzes(quizzesWithQuestionCount);

        if (hashtagRes.ok) {
          const hashtagData = await hashtagRes.json();
          setAllHashtags(hashtagData.hashtags);
        }
      } catch (e: any) {
        setError(e.message);
        toast.error(`데이터 로딩 실패: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzesAndHashtags();
  }, [query]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">공유 퀴즈 탐색</h1>
        <p className="text-lg text-gray-600 mt-2">다른 사용자들이 만든 퀴즈를 풀어보세요.</p>
        {query && (
          <p className="text-sm text-gray-500 mt-2">현재 검색어: <span className="font-semibold">"{query}"</span></p>
        )}
      </div>

      <SearchBar initialQuery={query} />

      {loading && <p className="text-center text-gray-600">퀴즈를 불러오는 중입니다...</p>}
      {error && <p className="text-red-500 text-center">오류: {error}</p>}

      {!loading && !error && (
        quizzes.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg bg-white">
            <h2 className="text-xl font-semibold">{query ? `"${query}"에 대한 검색 결과가 없습니다.` : "공유된 퀴즈가 없습니다."}</h2>
            <p className="text-gray-500 mt-2">다른 키워드로 검색하거나, 직접 퀴즈를 만들어 공유해보세요!</p>
            <div className="mt-6 flex gap-4 justify-center">
              <Button onClick={() => router.push('/shared-quizzes')}>모든 퀴즈 보기</Button>
              <Button asChild variant="secondary">
                <Link href="/create-quiz">퀴즈 만들러 가기</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">문제 수</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">좋아요</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">해시태그</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link href={`/quiz/${quiz.id}`} className="hover:underline">
                        {quiz.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" /> {quiz.questionCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-1 text-red-500" /> {quiz.totalLikes}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {quiz.hashtags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {quiz.hashtags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={(e) => { e.stopPropagation(); router.push(`/shared-quizzes?q=${encodeURIComponent(tag)}`); }}>
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">없음</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/quiz/${quiz.id}`)} title="퀴즈 풀기">
                        <Play className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

export default function SharedQuizzesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <Suspense fallback={<div className="text-center p-8">로딩 중...</div>}>
          <SharedQuizzesContent />
        </Suspense>
      </main>
    </div>
  );
}
