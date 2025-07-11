// /Users/kik/next_project/quizpick/src/app/api/quizzes/[id]/toggle-visibility/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server"; // Clerk getAuth 임포트

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = params;
        const { isShared }: { isShared: boolean } = await req.json();

        if (typeof isShared !== "boolean") {
            return NextResponse.json({ error: "isShared 값은 boolean이어야 합니다." }, { status: 400 });
        }

        const quiz = await prisma.quiz.findUnique({
            where: { id },
        });

        if (!quiz) {
            return NextResponse.json({ error: "퀴즈를 찾을 수 없습니다." }, { status: 404 });
        }

        if (quiz.userId !== userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const updatedQuiz = await prisma.quiz.update({
            where: { id },
            data: { isShared },
        });

        return NextResponse.json({ quiz: updatedQuiz });
    } catch (error: any) {
        console.error("Error toggling quiz visibility:", error);
        return NextResponse.json(
            { error: error.message ?? "퀴즈 공개 상태 변경 중 오류가 발생했습니다." },
            { status: 500 },
        );
    }
}