'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Quiz } from '@prisma/client';
import { QuizData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-hot-toast';
import { Heart, MessageSquare, Eye, EyeOff, Edit, Trash2, PlusCircle, Play } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">내 퀴즈 관리</h1>
          <Button asChild>
            <Link href="/create-quiz"><PlusCircle className="w-4 h-4 mr-2" />새 퀴즈 만들기</Link>
          </Button>
        </div>

        {loading && <p className="text-center text-gray-600">퀴즈를 불러오는 중입니다...</p>}
        {error && <p className="text-center text-red-500">오류: {error}</p>}

        {!loading && !error && (
          quizzes.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg bg-white">
              <h2 className="text-xl font-semibold">아직 생성된 퀴즈가 없습니다.</h2>
              <p className="text-gray-500 mt-2">새 퀴즈를 만들어 학습을 시작해보세요!</p>
              <Button asChild className="mt-6">
                <Link href="/create-quiz">퀴즈 만들러 가기</Link>
              </Button>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">공개 여부</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" /> {quiz.questionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                        <Heart className="w-4 h-4 mr-1 text-red-500" /> {quiz.totalLikes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant={quiz.isShared ? 'default' : 'secondary'}>
                          {quiz.isShared ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                          {quiz.isShared ? '공개' : '비공개'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/quiz/${quiz.id}`)} title="퀴즈 풀기">
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/edit-quiz/${quiz.id}`)} title="퀴즈 편집">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleToggleShare(quiz.id, quiz.isShared)} title={quiz.isShared ? '비공개로 전환' : '공개로 전환'}>
                            {quiz.isShared ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(quiz.id)} title="퀴즈 삭제">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </main>
    </div>
  );
}