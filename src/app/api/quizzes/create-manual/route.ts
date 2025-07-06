import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { QuizData } from '@/lib/types';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
    try {
        /* 1) 로그인 체크 */
        const { userId } = getAuth(req);
        if (!userId) {
            // ✅ 항상 JSON으로
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        /* 2) 요청 파싱 */
        const { title, questions }: {
            title: string;
            questions: Array<{ questionText: string; answerText: string }>;
        } = await req.json();

        if (!title || !questions?.length) {
            return NextResponse.json(
                { error: '제목과 퀴즈 데이터는 필수입니다.' },
                { status: 400 },
            );
        }

        /* 3) QuizData 변환 */
        const quizData: QuizData = {
            manual: questions.map(q => ({ question: q.questionText, answer: q.answerText })),
        };

        /* 4) DB 저장 */
        const newQuiz = await prisma.quiz.create({
            data: {
                title,
                quizData,
                isShared: false,
                userId,
            },
        });

        /* 5) 성공 응답 → quizId 포함 */
        return NextResponse.json({ quizId: newQuiz.id }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating manual quiz:', error);
        return NextResponse.json(
            { error: error.message ?? '퀴즈 생성 중 오류가 발생했습니다.' },
            { status: 500 },
        );
    }
}
