import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import QuizSession from '@/components/QuizSession';
import { QuizData } from '@/lib/types';

interface QuizPageProps {
  params: {
    id: string;
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
  });

  if (!quiz) {
    notFound();
  }

  // Prisma의 Json 타입은 unknown으로 추론될 수 있으므로 명시적으로 캐스팅
  const quizData: QuizData = quiz.quizData as QuizData;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
      <QuizSession quizData={quizData} />
    </div>
  );
}
