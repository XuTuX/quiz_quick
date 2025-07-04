import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { QuizData } from "@/lib/types";
import { auth } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { title, quizData }: { title: string; quizData: QuizData } = await req.json();

        if (!title || !quizData) {
            return NextResponse.json({ error: "제목과 퀴즈 데이터는 필수입니다." }, { status: 400 });
        }

        const newQuiz = await prisma.quiz.create({
            data: {
                title,
                quizData,
                isShared: false, // 기본적으로 비공개
                userId: userId, // Add userId here
            },
        });

        return NextResponse.json({ quiz: newQuiz }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating manual quiz:", error);
        return NextResponse.json(
            { error: error.message ?? "퀴즈 생성 중 오류가 발생했습니다." },
            { status: 500 },
        );
    }
}