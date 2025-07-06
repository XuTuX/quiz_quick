
import { NextRequest, NextResponse } from "next/server"; // ✅ NextRequest로!
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { QuizData } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      select: { quizData: true, title: true }, // Include title for editing
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, quizData }: {
      title: string;
      quizData: QuizData;
    } = await req.json();

    if (!title || !Object.keys(quizData).length) {
      return NextResponse.json(
        { error: "제목과 퀴즈 데이터는 필수입니다." },
        { status: 400 }
      );
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id: params.id, userId: userId }, // Ensure user owns the quiz
      data: {
        title,
        quizData,
      },
    });

    return NextResponse.json({ quiz: updatedQuiz }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: error.message ?? "퀴즈 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
