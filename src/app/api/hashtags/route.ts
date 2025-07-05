import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const quizzes = await prisma.quiz.findMany({
            where: {
                isShared: true,
                hashtags: {
                    isEmpty: false, // 해시태그가 비어있지 않은 퀴즈만
                },
            },
            select: {
                hashtags: true,
            },
        });

        const allHashtags = quizzes.flatMap(quiz => quiz.hashtags);
        const uniqueHashtags = Array.from(new Set(allHashtags));

        return NextResponse.json({ hashtags: uniqueHashtags });
    } catch (error: any) {
        console.error("Error fetching hashtags:", error);
        return NextResponse.json(
            { error: error.message ?? "해시태그를 가져오는 중 오류가 발생했습니다." },
            { status: 500 },
        );
    }
}
