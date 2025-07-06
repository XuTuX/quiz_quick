'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle } from 'lucide-react';
import { QuizData, QuizItem } from '@/lib/types';

interface QaPair {
  question: string;
  answer: string;
}
interface CategoryBlock {
  category: string;
  qaPairs: QaPair[];
}

export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [quizTitle, setQuizTitle] = useState('');
  const [blocks, setBlocks] = useState<CategoryBlock[]>([
    { category: '', qaPairs: [{ question: '', answer: '' }] },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refs = useRef<(HTMLTextAreaElement | HTMLInputElement | null)[][][]>([]);
  const [focusTarget, setFocusTarget] = useState<{
    b: number;
    r: number;
    f: 'question' | 'answer';
  } | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quizzes/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch quiz: ${res.statusText}`);
        const data = await res.json();

        setQuizTitle(data.quiz.title);

        const loadedBlocks: CategoryBlock[] = [];
        const quizData: QuizData = data.quiz.quizData;

        for (const category in quizData) {
          loadedBlocks.push({
            category: category,
            qaPairs: quizData[category].map((item: QuizItem) => ({
              question: item.question,
              answer: item.answer,
            })),
          });
        }
        setBlocks(loadedBlocks.length > 0 ? loadedBlocks : [{ category: '', qaPairs: [{ question: '', answer: '' }] }]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    while (refs.current.length < blocks.length) refs.current.push([]);
    blocks.forEach((block, b) => {
      while ((refs.current[b] ?? []).length < block.qaPairs.length)
        refs.current[b].push([null, null]);
    });
  }, [blocks]);

  useEffect(() => {
    if (!focusTarget) return;
    const { b, r, f } = focusTarget;
    refs.current[b]?.[r]?.[f === 'question' ? 0 : 1]?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

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

  const handleKey = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
    bIdx: number,
    rIdx: number,
    field: 'question' | 'answer'
  ) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (field === 'question') {
        setFocusTarget({ b: bIdx, r: rIdx, f: 'answer' });
      } else {
        const isLastRow = rIdx === blocks[bIdx].qaPairs.length - 1;
        if (isLastRow) {
          addRow(bIdx);
          setFocusTarget({ b: bIdx, r: rIdx + 1, f: 'question' });
        } else {
          setFocusTarget({ b: bIdx, r: rIdx + 1, f: 'question' });
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (
      !quizTitle.trim() ||
      blocks.some(b =>
        b.qaPairs.some(qa => !qa.question.trim() || !qa.answer.trim())
      )
    ) {
      alert('제목과 모든 질문/답변을 입력해주세요.');
      return;
    }

    const quizData: QuizData = {};
    blocks.forEach(block => {
      if (block.category.trim()) {
        quizData[block.category.trim()] = block.qaPairs.map(qa => ({
          question: qa.question.trim(),
          answer: qa.answer.trim(),
        }));
      }
    });

    const payload = {
      title: quizTitle.trim(),
      quizData,
    };

    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? '퀴즈 업데이트 실패');
      router.push(`/quiz/${id}`);
    } catch (err) {
      console.error(err);
      alert('퀴즈 업데이트 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="container mx-auto p-4">로딩 중...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">오류: {error}</div>;

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-4 bg-gray-50">
      <Card className="w-full max-w-5xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-800">
            퀴즈 편집
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="예) 인체 해부학 퀴즈"
            value={quizTitle}
            onChange={e => setQuizTitle(e.target.value)}
          />
        </CardContent>
      </Card>

      {blocks.map((block, bIdx) => (
        <Card
          key={bIdx}
          className="w-full max-w-5xl shadow-lg border-t-4 border-dashed"
        >
          <CardHeader className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4 mb-2">
            <div className="flex w-full md:w-auto items-center gap-2">
              <span className="text-sm font-bold text-gray-600 whitespace-nowrap">
                CATEGORY:
              </span>
              <Input
                placeholder="카테고리 이름"
                value={block.category}
                onChange={e => updateCategoryTitle(bIdx, e.target.value)}
                className="flex-1 text-lg font-semibold"
              />
            </div>
            {blocks.length > 1 && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeCategory(bIdx)}
                aria-label="카테고리 삭제"
              >
                <Trash2 className="text-gray-400 hover:text-red-500" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {block.qaPairs.map((qa, rIdx) => (
              <div
                key={rIdx}
                className="relative flex flex-col md:flex-row gap-3 md:gap-4"
              >
                {block.qaPairs.length > 1 && (
                  <button
                    aria-label="질문 삭제"
                    onClick={() => removeRow(bIdx, rIdx)}
                    className="absolute -right-2 -top-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <Textarea
                  ref={el => {
                    if (!refs.current[bIdx]) refs.current[bIdx] = [];
                    if (!refs.current[bIdx][rIdx])
                      refs.current[bIdx][rIdx] = [null, null];
                    refs.current[bIdx][rIdx][0] = el;
                  }}
                  rows={2}
                  placeholder={`Q${rIdx + 1}`}
                  value={qa.question}
                  onChange={e =>
                    updateRow(bIdx, rIdx, 'question', e.target.value)
                  }
                  onKeyDown={e => handleKey(e, bIdx, rIdx, 'question')}
                  className="w-full md:w-[65%] flex-1 resize-y md:resize-none"
                />
                <Textarea
                  ref={el => {
                    if (!refs.current[bIdx]) refs.current[bIdx] = [];
                    if (!refs.current[bIdx][rIdx])
                      refs.current[bIdx][rIdx] = [null, null];
                    refs.current[bIdx][rIdx][1] = el;
                  }}
                  rows={2}
                  placeholder={`A${rIdx + 1}`}
                  value={qa.answer}
                  onChange={e =>
                    updateRow(bIdx, rIdx, 'answer', e.target.value)
                  }
                  onKeyDown={e => handleKey(e, bIdx, rIdx, 'answer')}
                  className="w-full md:w-[35%] resize-y md:resize-none"
                />
              </div>
            ))}
            <Button
              onClick={() => addRow(bIdx)}
              variant="secondary"
              className="w-full py-2"
            >
              + 질문 추가
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button
        onClick={addCategory}
        variant="outline"
        className="flex items-center gap-2 text-blue-600"
      >
        <PlusCircle className="h-5 w-5" /> 카테고리 추가
      </Button>
      <Button
        onClick={handleSubmit}
        className="mt-6 w-full max-w-5xl py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold"
      >
        퀴즈 업데이트
      </Button>
    </main>
  );
}
