import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = params;

        const deletedQuiz = await prisma.quiz.delete({
            where: { id },
        });

        if (!deletedQuiz) {
            return NextResponse.json({ error: "퀴즈를 찾을 수 없습니다." }, { status: 404 });
        }

        return NextResponse.json({ message: "퀴즈가 성공적으로 삭제되었습니다." });
    } catch (error: any) {
        console.error("Error deleting quiz:", error);
        return NextResponse.json(
            { error: error.message ?? "퀴즈 삭제 중 오류가 발생했습니다." },
            { status: 500 },
        );
    }
}