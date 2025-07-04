import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = params;

        const quiz = await prisma.quiz.findUnique({
            where: { id },
        });

        if (!quiz) {
            return NextResponse.json({ error: "퀴즈를 찾을 수 없습니다." }, { status: 404 });
        }

        if (quiz.userId !== userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const deletedQuiz = await prisma.quiz.delete({
            where: { id },
        });

        return NextResponse.json({ message: "퀴즈가 성공적으로 삭제되었습니다." });
    } catch (error: any) {
        console.error("Error deleting quiz:", error);
        return NextResponse.json(
            { error: error.message ?? "퀴즈 삭제 중 오류가 발생했습니다." },
            { status: 500 },
        );
    }
}