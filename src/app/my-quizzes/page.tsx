'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Quiz } from '@prisma/client';
import { QuizData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-hot-toast';

import { Heart, MessageSquare, Eye, EyeOff, Edit, Trash2, PlusCircle } from 'lucide-react';

interface MyQuiz extends Quiz {
  totalLikes: number;
  questionCount: number;
}

export default function MyQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<MyQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/quizzes/my-quizzes');
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
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
      toast.error(`퀴즈를 불러오는 데 실패했습니다: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 퀴즈를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      const res = await fetch(`/api/quizzes/${id}/delete`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`삭제 실패: ${res.status}`);
      setQuizzes((qs) => qs.filter((q) => q.id !== id));
      toast.success('퀴즈가 삭제되었습니다.');
    } catch (e: any) {
      toast.error(`삭제 중 오류 발생: ${e.message}`);
    }
  };

  const handleToggleShare = async (id: string, isShared: boolean) => {
    try {
      const res = await fetch(`/api/quizzes/${id}/toggle-visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isShared: !isShared }),
      });
      if (!res.ok) throw new Error(`상태 변경 실패: ${res.status}`);
      const { quiz: updatedQuiz } = await res.json();
      
      // Ensure totalLikes and questionCount are preserved
      const originalQuiz = quizzes.find(q => q.id === id);
      const finalQuiz = { 
        ...updatedQuiz, 
        totalLikes: originalQuiz?.totalLikes ?? 0,
        questionCount: originalQuiz?.questionCount ?? 0
      };

      setQuizzes((qs) => qs.map((q) => (q.id === id ? finalQuiz : q)));
      toast.success(updatedQuiz.isShared ? '퀴즈가 공개되었습니다.' : '퀴즈가 비공개로 전환되었습니다.');
    } catch (e: any) {
      toast.error(`상태 변경 중 오류 발생: ${e.message}`);
    }
  };

  const renderQuizCard = (quiz: MyQuiz) => (
    <Card key={quiz.id} className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-xl font-bold cursor-pointer" onClick={() => router.push(`/quiz/${quiz.id}`)}>{quiz.title}</CardTitle>
        <div className="text-sm text-gray-500 pt-2">
          {new Date(quiz.createdAt).toLocaleDateString()} 생성
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center"><MessageSquare className="w-4 h-4 mr-1" /> {quiz.questionCount} 문제</div>
          <div className="flex items-center"><Heart className="w-4 h-4 mr-1" /> {quiz.totalLikes} 좋아요</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant={quiz.isShared ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => handleToggleShare(quiz.id, quiz.isShared)}>
          {quiz.isShared ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
          {quiz.isShared ? '공개' : '비공개'}
        </Badge>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/edit-quiz/${quiz.id}`)}><Edit className="w-4 h-4" /></Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(quiz.id)}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">내 퀴즈 관리</h1>
          <Button asChild>
            <Link href="/create-quiz"><PlusCircle className="w-4 h-4 mr-2" />새 퀴즈 만들기</Link>
          </Button>
        </div>

        {loading && <p>퀴즈를 불러오는 중입니다...</p>}
        {error && <p className="text-red-500">오류: {error}</p>}

        {!loading && !error && (
          quizzes.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h2 className="text-xl font-semibold">아직 생성된 퀴즈가 없습니다.</h2>
              <p className="text-gray-500 mt-2">새 퀴즈를 만들어 학습을 시작해보세요!</p>
              <Button asChild className="mt-6">
                <Link href="/create-quiz">퀴즈 만들러 가기</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map(renderQuizCard)}
            </div>
          )
        )}
      </main>
    </div>
  );
}
