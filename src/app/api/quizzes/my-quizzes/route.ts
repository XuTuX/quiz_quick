import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const quizzes = await prisma.quiz.findMany();
        return NextResponse.json({ quizzes });
    } catch (error: any) {
        console.error("Error fetching my quizzes:", error);
        return NextResponse.json(
            { error: error.message ?? "내 퀴즈를 가져오는 중 오류가 발생했습니다." },
            { status: 500 },
        );
    }
}