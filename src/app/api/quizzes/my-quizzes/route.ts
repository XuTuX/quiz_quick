// /Users/kik/next_project/quizpick/src/app/api/quizzes/my-quizzes/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server"; // getAuth 임포트

export async function GET(req: NextRequest) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const quizzes = await prisma.quiz.findMany({
            where: { userId: userId },
        });
        return NextResponse.json({ quizzes });
    } catch (error: any) {
        console.error("Error fetching my quizzes:", error);
        return NextResponse.json(
            { error: error.message ?? "내 퀴즈를 가져오는 중 오류가 발생했습니다." },
            { status: 500 },
        );
    }
}