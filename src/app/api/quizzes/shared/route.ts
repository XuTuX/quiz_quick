import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("search"); // 'search' 파라미터로 검색어 가져오기

        const whereClause: { isShared: boolean; title?: { contains: string; mode: "insensitive" } } = {
            isShared: true,
        };

        if (query) {
            whereClause.title = {
                contains: query,
                mode: "insensitive", // 대소문자 구분 없이 검색
            };
        }

        const sharedQuizzes = await prisma.quiz.findMany({
            where: whereClause,
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
