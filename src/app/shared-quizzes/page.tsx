'use client';

import { useEffect, useState, Suspense, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { QuizData } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, MessageSquare, Search } from 'lucide-react';

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
    <form onSubmit={handleSearch} className="flex w-full max-w-xl mx-auto mb-8">
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

  const renderQuizCard = (quiz: SharedQuiz) => (
    <Card key={quiz.id} className="flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/quiz/${quiz.id}`)}>
      <CardHeader>
        <CardTitle className="text-xl font-bold">{quiz.title}</CardTitle>
        <div className="text-sm text-gray-500 pt-2">
          {new Date(quiz.createdAt).toLocaleDateString()}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center"><MessageSquare className="w-4 h-4 mr-1" /> {quiz.questionCount} 문제</div>
          <div className="flex items-center"><Heart className="w-4 h-4 mr-1 text-red-500" /> {quiz.totalLikes} 좋아요</div>
        </div>
        {quiz.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quiz.hashtags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={(e) => { e.stopPropagation(); router.push(`/shared-quizzes?q=${encodeURIComponent(tag)}`); }}>
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={(e) => { e.stopPropagation(); router.push(`/quiz/${quiz.id}`); }}>퀴즈 풀기</Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">공유 퀴즈 탐색</h1>
        <p className="text-lg text-gray-600 mt-2">다른 사용자들이 만든 퀴즈를 풀어보세요.</p>
      </div>
      
      <SearchBar initialQuery={query} />

      {allHashtags.length > 0 && !query && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-center">인기 해시태그</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {allHashtags.map((tag) => (
              <Button key={tag} variant="outline" onClick={() => router.push(`/shared-quizzes?q=${encodeURIComponent(tag)}`)}>
                #{tag}
              </Button>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-center">퀴즈를 불러오는 중입니다...</p>}
      {error && <p className="text-red-500 text-center">오류: {error}</p>}

      {!loading && !error && (
        quizzes.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map(renderQuizCard)}
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
