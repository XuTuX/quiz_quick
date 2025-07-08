import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LikeButton from "@/components/LikeButton";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { Badge } from "@/components/ui/badge";
import { BookOpen, Edit, LayoutGrid } from "lucide-react";

export default async function QuizCategorySelectPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await currentUser();
  const userId = user?.id ?? null;

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      quizData: true,
      totalLikes: true,
      userId: true,
    },
  });
  if (!quiz) notFound();

  const initiallyLiked = userId
    ? Boolean(
      await prisma.like.findUnique({
        where: { quizId_userId: { quizId: params.id, userId } },
        select: { id: true },
      })
    )
    : false;

  const quizData = quiz.quizData as Record<string, any[]>;
  const categories = Object.keys(quizData);
  const allQuestionsCount = categories.reduce(
    (acc, cat) => acc + quizData[cat].length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4 md:p-8">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle className="text-3xl font-bold">{quiz.title}</CardTitle>
            <div className="flex items-center gap-2">
              {userId === quiz.userId && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/edit-quiz/${params.id}`}>
                    <Edit className="w-4 h-4 mr-2" />
                    편집
                  </Link>
                </Button>
              )}
              <LikeButton
                quizId={params.id}
                initiallyLiked={initiallyLiked}
                initialCount={quiz.totalLikes}
              />
            </div>
          </CardHeader>

          <CardContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* All Questions Card */}
              <Link href={`/quiz/${params.id}/all`} className="md:col-span-2">
                <div className="p-6 border rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex justify-between items-center">
                  <div className="flex items-center">
                    <LayoutGrid className="w-6 h-6 mr-3" />
                    <span className="text-xl font-semibold">전체 문제 풀기</span>
                  </div>
                  <Badge variant="secondary" className="text-base bg-purple-700 text-white">
                    {allQuestionsCount} 문제
                  </Badge>
                </div>
              </Link>

              {/* Category Cards */}
              {categories.map((cat) => (
                <Link key={cat} href={`/quiz/${params.id}/${encodeURIComponent(cat)}`}>
                  <div className="p-6 border rounded-lg hover:bg-gray-100 transition-colors flex justify-between items-center">
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-3 text-gray-600" />
                      <span className="text-lg font-medium">{cat}</span>
                    </div>
                    <Badge variant="outline" className="text-base">
                      {quizData[cat].length} 문제
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
