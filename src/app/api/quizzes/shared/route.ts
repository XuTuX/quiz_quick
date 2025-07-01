import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const sharedQuizzes = await prisma.quiz.findMany({
            where: { isShared: true },
        });
        return NextResponse.json({ quizzes: sharedQuizzes });
    } catch (error: any) {
        console.error("Error fetching shared quizzes:", error);
        return NextResponse.json(
            { error: error.message ?? "공유된 퀴즈를 가져오는 중 오류가 발생했습니다." },
            { status: 500 },
        );
    }
}