
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function QuizCategorySelectPage({
  params,
}: {
  params: { id: string };
}) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      quizData: true,
    },
  });

  if (!quiz) {
    notFound();
  }

  const quizData = quiz.quizData as Record<string, any[]>;
  const categories = Object.keys(quizData);
  const allQuestionsCount = categories.reduce(
    (acc, cat) => acc + quizData[cat].length,
    0
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {quiz.title}
          </CardTitle>
          <p className="text-center text-muted-foreground">
            학습할 카테고리를 선택하세요.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Button
              key={cat}
              asChild
              className="h-16 text-lg justify-between"
              variant="outline"
            >
              <Link href={`/quiz/${params.id}/${encodeURIComponent(cat)}`}>
                <span>{cat}</span>
                <span className="text-sm font-normal bg-gray-200 px-2 py-1 rounded">
                  {quizData[cat].length} 문제
                </span>
              </Link>
            </Button>
          ))}
          <Button
            asChild
            className="h-16 text-lg justify-between md:col-span-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Link href={`/quiz/${params.id}/all`}>
              <span>전체 문제 풀기</span>
              <span className="text-sm font-normal bg-blue-400 px-2 py-1 rounded">
                {allQuestionsCount} 문제
              </span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
