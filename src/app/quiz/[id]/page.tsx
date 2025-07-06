// src/app/quiz/[id]/page.tsx   ← 예: 페이지 파일 이름·경로 맞춰주세요
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LikeButton from "@/components/LikeButton";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";     // 🔑 서버 컴포넌트용 Clerk 헬퍼

export default async function QuizCategorySelectPage({
  params,
}: {
  params: { id: string };
}) {
  // 1) 현재 로그인한 사용자 ID
  const user = await currentUser();
  const userId = user?.id ?? null;

  // 2) 퀴즈 정보 + 좋아요 수
  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      quizData: true,
      totalLikes: true,
      userId: true, // Fetch quiz owner's ID
    },
  });
  if (!quiz) notFound();

  // 3) 이 사용자가 이미 눌렀는지
  const initiallyLiked = userId
    ? Boolean(
      await prisma.like.findUnique({
        where: { quizId_userId: { quizId: params.id, userId } },
        select: { id: true },
      })
    )
    : false;

  // 4) 카테고리·문제 수 계산
  const quizData = quiz.quizData as Record<string, any[]>;
  const categories = Object.keys(quizData);
  const allQuestionsCount = categories.reduce(
    (acc, cat) => acc + quizData[cat].length,
    0
  );

  /* ------------------- 렌더링 ------------------- */
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-col items-center gap-2">
          {/* 제목 + 좋아요 버튼 나란히 배치 */}
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl font-bold">{quiz.title}</CardTitle>
            <LikeButton
              quizId={params.id}
              initiallyLiked={initiallyLiked}
              initialCount={quiz.totalLikes}
            />
          </div>
          <p className="text-center text-muted-foreground">
            학습할 카테고리를 선택하세요.
          </p>
          {userId === quiz.userId && (
            <Link href={`/edit-quiz/${params.id}`}>
              <Button variant="outline" className="mt-4">편집</Button>
            </Link>
          )}
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

          {/* 전체 문제 풀기 */}
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
