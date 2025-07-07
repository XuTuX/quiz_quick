// /Users/kik/next_project/quizpick/src/app/api/quizzes/[id]/toggle-like/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { userId } = getAuth(req);      // ← 여기만 변경
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const quizId = params.id;
    const likeKey = { quizId_userId: { quizId, userId } };

    const existing = await prisma.like.findUnique({ where: likeKey });

    let liked: boolean;
    if (existing) {
        await prisma.$transaction([
            prisma.like.delete({ where: likeKey }),
            prisma.quiz.update({
                where: { id: quizId },
                data: { totalLikes: { decrement: 1 } },
            }),
        ]);
        liked = false;
    } else {
        await prisma.$transaction([
            prisma.like.create({ data: { quizId, userId } }),
            prisma.quiz.update({
                where: { id: quizId },
                data: { totalLikes: { increment: 1 } },
            }),
        ]);
        liked = true;
    }

    const { totalLikes } = await prisma.quiz.findUniqueOrThrow({
        where: { id: quizId },
        select: { totalLikes: true },
    });

    return NextResponse.json({ liked, totalLikes });
}