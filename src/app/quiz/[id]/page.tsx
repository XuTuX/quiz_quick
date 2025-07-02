// src/app/quiz/[id]/page.tsx
// Next.js 15 이상용 ― params Promise 대응 완료

import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import QuizSession from '@/components/QuizSession';
import { QuizData } from '@/lib/types';

/** 동적 라우트 매개변수 타입 */
type Params = { id: string };

interface QuizPageProps {
  /** Next 15부터 Promise 로 전달됨 */
  params: Promise<Params>;
}

/**
 * 퀴즈 상세 페이지
 * - URL  : /quiz/[id]
 * - 역할 : DB에서 퀴즈 불러와 <QuizSession>에 전달
 */
export default async function QuizPage({ params }: QuizPageProps) {
  // 1. Promise 해제 후 id 추출
  const { id } = await params;

  // 2. 유효성 검사
  if (!id) notFound();

  // 3. DB 조회
  const quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz) notFound();

  // 4. JSON → 타입 단언
  const quizData = quiz.quizData as unknown as QuizData;

  // 5. 렌더링
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
      <QuizSession initialQuizData={quizData} />
    </div>
  );
}
