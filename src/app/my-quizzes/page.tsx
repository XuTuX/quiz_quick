'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Quiz } from '@prisma/client';
import { QuizData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-hot-toast';
import { Heart, MessageSquare, Eye, EyeOff, Edit, Trash2, PlusCircle, Play, ArrowUpNarrowWide, ArrowDownWideNarrow } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MyQuiz extends Quiz {
  totalLikes: number;
  questionCount: number;
}

type SortKey = 'createdAt' | 'title' | 'questionCount' | 'totalLikes' | 'isShared';
type SortOrder = 'asc' | 'desc';

export default function MyQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<MyQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/quizzes/my-quizzes');
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
      const data = await res.json();
      let quizzesWithQuestionCount = data.quizzes.map((quiz: Quiz) => {
        const quizData = quiz.quizData as unknown as QuizData;
        let totalQuestions = 0;
        for (const category in quizData) {
          totalQuestions += quizData[category].length;
        }
        return { ...quiz, questionCount: totalQuestions };
      });

      quizzesWithQuestionCount.sort((a: MyQuiz, b: MyQuiz) => {
        let comparison = 0;

        // Primary sort
        let valA: any;
        let valB: any;

        switch (sortKey) {
          case 'createdAt':
            valA = new Date(a.createdAt).getTime();
            valB = new Date(b.createdAt).getTime();
            break;
          case 'title':
            valA = a.title.toLowerCase();
            valB = b.title.toLowerCase();
            break;
          case 'questionCount':
            valA = a.questionCount;
            valB = b.questionCount;
            break;
          case 'totalLikes':
            valA = a.totalLikes;
            valB = b.totalLikes;
            break;
          case 'isShared':
            valA = a.isShared ? 1 : 0;
            valB = b.isShared ? 1 : 0;
            break;
          default:
            valA = new Date(a.createdAt).getTime();
            valB = new Date(b.createdAt).getTime();
        }

        if (valA < valB) comparison = -1;
        else if (valA > valB) comparison = 1;

        if (sortOrder === 'desc') comparison *= -1;

        // Secondary sort by isShared if primary sort is not isShared and primary sort results in equality
        if (sortKey !== 'isShared' && comparison === 0) {
          const isSharedA = a.isShared ? 1 : 0;
          const isSharedB = b.isShared ? 1 : 0;
          if (isSharedA > isSharedB) return -1; // Public (1) comes before Private (0)
          if (isSharedA < isSharedB) return 1;
        }

        return comparison;
      });

      setQuizzes(quizzesWithQuestionCount);
    } catch (e: any) {
      setError(e.message);
      toast.error(`퀴즈를 불러오는 데 실패했습니다: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, [sortKey, sortOrder]);

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
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  정렬 기준: {sortKey === 'createdAt' ? '생성일' : sortKey === 'title' ? '제목' : sortKey === 'questionCount' ? '문제 수' : sortKey === 'totalLikes' ? '좋아요' : '공개 여부'}
                  {sortOrder === 'asc' ? <ArrowUpNarrowWide className="ml-2 h-4 w-4" /> : <ArrowDownWideNarrow className="ml-2 h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setSortKey('createdAt'); setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc'); }}>
                  생성일 {sortKey === 'createdAt' && (sortOrder === 'desc' ? <ArrowDownWideNarrow className="ml-2 h-4 w-4" /> : <ArrowUpNarrowWide className="ml-2 h-4 w-4" />)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortKey('title'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  제목 {sortKey === 'title' && (sortOrder === 'asc' ? <ArrowUpNarrowWide className="ml-2 h-4 w-4" /> : <ArrowDownWideNarrow className="ml-2 h-4 w-4" />)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortKey('questionCount'); setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc'); }}>
                  문제 수 {sortKey === 'questionCount' && (sortOrder === 'desc' ? <ArrowDownWideNarrow className="ml-2 h-4 w-4" /> : <ArrowUpNarrowWide className="ml-2 h-4 w-4" />)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortKey('totalLikes'); setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc'); }}>
                  좋아요 {sortKey === 'totalLikes' && (sortOrder === 'desc' ? <ArrowDownWideNarrow className="ml-2 h-4 w-4" /> : <ArrowUpNarrowWide className="ml-2 h-4 w-4" />)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortKey('isShared'); setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc'); }}>
                  공개 여부 {sortKey === 'isShared' && (sortOrder === 'desc' ? <ArrowDownWideNarrow className="ml-2 h-4 w-4" /> : <ArrowUpNarrowWide className="ml-2 h-4 w-4" />)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild>
              <Link href="/create-quiz"><PlusCircle className="w-4 h-4 mr-2" />새 퀴즈 만들기</Link>
            </Button>
          </div>
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
                        <div className="flex items-center gap-2">
                          <Badge variant={quiz.isShared ? 'default' : 'secondary'}>
                            {quiz.isShared ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                            {quiz.isShared ? '공개' : '비공개'}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => handleToggleShare(quiz.id, quiz.isShared)} title={quiz.isShared ? '비공개로 전환' : '공개로 전환'}>
                            {quiz.isShared ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/quiz/${quiz.id}`)} title="퀴즈 풀기">
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/edit-quiz/${quiz.id}`)} title="퀴즈 편집">
                            <Edit className="w-4 h-4" />
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