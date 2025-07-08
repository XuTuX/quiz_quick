import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LikeButton from "@/components/LikeButton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Edit, LayoutGrid } from "lucide-react";

import QuizCategorySelectClient from "./QuizCategorySelectClient"; // New client component

interface QuizPageProps {
  params: { id: string };
}

export default async function QuizCategorySelectPage({ params }: QuizPageProps) {
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
    <QuizCategorySelectClient
      quizId={params.id}
      quizTitle={quiz.title}
      quizData={quizData}
      totalLikes={quiz.totalLikes}
      quizUserId={quiz.userId}
      currentUserId={userId}
      initiallyLiked={initiallyLiked}
      allQuestionsCount={allQuestionsCount}
      categories={categories}
    />
  );
}

