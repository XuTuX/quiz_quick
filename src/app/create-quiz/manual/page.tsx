'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { QuizData } from '@/lib/types';
import { Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { toast } from 'react-hot-toast';

interface QaPair {
  question: string;
  answer: string;
}
interface Category {
  category: string;
  qaPairs: QaPair[];
}

export default function CreateQuizManualPage() {
  const [quizTitle, setQuizTitle] = useState('');
  const [blocks, setBlocks] = useState<Category[]>([
    { category: '', qaPairs: [{ question: '', answer: '' }] },
  ]);
  const router = useRouter();

  const addCategory = () =>
    setBlocks(prev => [
      ...prev,
      { category: '', qaPairs: [{ question: '', answer: '' }] },
    ]);
  const removeCategory = (bIdx: number) =>
    blocks.length > 1 && setBlocks(prev => prev.filter((_, i) => i !== bIdx));
  const updateCategoryTitle = (bIdx: number, title: string) =>
    setBlocks(prev =>
      prev.map((b, i) => (i === bIdx ? { ...b, category: title } : b))
    );

  const addRow = (bIdx: number) =>
    setBlocks(prev =>
      prev.map((b, i) =>
        i === bIdx
          ? { ...b, qaPairs: [...b.qaPairs, { question: '', answer: '' }] }
          : b
      )
    );
  const removeRow = (bIdx: number, rIdx: number) =>
    setBlocks(prev =>
      prev.map((b, i) =>
        i === bIdx && b.qaPairs.length > 1
          ? { ...b, qaPairs: b.qaPairs.filter((_, j) => j !== rIdx) }
          : b
      )
    );
  const updateRow = (
    bIdx: number,
    rIdx: number,
    field: 'question' | 'answer',
    value: string
  ) =>
    setBlocks(prev =>
      prev.map((b, i) =>
        i === bIdx
          ? {
            ...b,
            qaPairs: b.qaPairs.map((qa, j) =>
              j === rIdx ? { ...qa, [field]: value } : qa
            ),
          }
          : b
      )
    );

  const handleSubmit = async () => {
    if (!quizTitle.trim()) {
      toast.error('퀴즈 제목을 입력해주세요.');
      return;
    }

    const filteredBlocks = blocks.map(block => ({
      ...block,
      qaPairs: block.qaPairs.filter(
        qa => qa.question.trim() && qa.answer.trim()
      ),
    })).filter(block => block.qaPairs.length > 0);

    if (filteredBlocks.length === 0) {
      toast.error('하나 이상의 질문과 답변을 입력해주세요.');
      return;
    }

    const quizData: QuizData = {};
    filteredBlocks.forEach((block, idx) => {
      const name = block.category.trim() || `카테고리 ${idx + 1}`;
      quizData[name] = block.qaPairs.map(qa => ({
        question: qa.question.trim(),
        answer: qa.answer.trim(),
      }));
    });

    try {
      const res = await fetch('/api/quizzes/create-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: quizTitle.trim(), quizData }),
      });
      if (!res.ok) throw new Error('퀴즈 생성에 실패했습니다.');
      const data = await res.json();
      toast.success('퀴즈가 성공적으로 생성되었습니다!');
      router.push(`/quiz/${data.quizId}`);
    } catch (err: any) {
      toast.error(err.message || '퀴즈 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>퀴즈 정보</CardTitle>
              <CardDescription>퀴즈의 제목을 입력해주세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="예: 정보처리기사 2024년 1회 필기 요약"
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
                className="text-lg"
              />
            </CardContent>
          </Card>

          {blocks.map((block, bIdx) => (
            <Card key={bIdx} className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Input
                    placeholder={`카테고리 ${bIdx + 1}`}
                    value={block.category}
                    onChange={e => updateCategoryTitle(bIdx, e.target.value)}
                    className="text-xl font-bold border-none shadow-none p-0 focus-visible:ring-0"
                  />
                  {blocks.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeCategory(bIdx)}
                    >
                      <Trash2 className="text-gray-500 hover:text-red-500" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {block.qaPairs.map((qa, rIdx) => (
                  <div key={rIdx} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg relative">
                    <div className="flex-1 space-y-2">
                      <Textarea
                        rows={2}
                        placeholder={`질문 ${rIdx + 1}`}
                        value={qa.question}
                        onChange={e => updateRow(bIdx, rIdx, 'question', e.target.value)}
                        className="resize-y"
                      />
                      <Textarea
                        rows={2}
                        placeholder={`답변 ${rIdx + 1}`}
                        value={qa.answer}
                        onChange={e => updateRow(bIdx, rIdx, 'answer', e.target.value)}
                        className="resize-y"
                      />
                    </div>
                    {block.qaPairs.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeRow(bIdx, rIdx)}
                        className="flex-shrink-0"
                      >
                        <Trash2 size={18} className="text-gray-400" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  onClick={() => addRow(bIdx)}
                  variant="secondary"
                  className="w-full"
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> 질문 추가
                </Button>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between items-center mt-8">
            <Button
              onClick={addCategory}
              variant="outline"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> 카테고리 추가
            </Button>
            <Button
              onClick={handleSubmit}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              퀴즈 생성 완료
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
