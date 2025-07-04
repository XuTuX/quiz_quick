import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QuizData } from "@/lib/types";
import prisma from "@/lib/prisma"; // Prisma 클라이언트 임포트
import { getAuth } from "@clerk/nextjs/server"; // Clerk getAuth 임포트

export const runtime = "nodejs";
export const preferredRegion = "iad1";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { userId } = getAuth(req); // 현재 로그인한 사용자 ID 가져오기
        console.log("API Route userId:", userId); // 디버깅을 위한 로그 추가

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file)
            return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
        if (file.type !== "application/pdf")
            return NextResponse.json(
                { error: "PDF 파일만 업로드할 수 있습니다." },
                { status: 400 },
            );
        // 🔄 20 MB 한도로 상향
        if (file.size > 15 * 1024 * 1024)
            return NextResponse.json(
                { error: "파일 크기는 15 MB를 초과할 수 없습니다." },
                { status: 400 },
            );

        // 🔄 PDF를 base64로 인라인 첨부
        const buffer = Buffer.from(await file.arrayBuffer());

        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
        });

        const prompt = `
   다음 텍스트를 기반으로 중요한 내용을 학습할 수 있는 퀴즈를 생성해줘.
      - 각 질문은 "question" 필드에, 정답은 "answer" 필드에 포함해야 해.
      - 전체 퀴즈를 주제별로 1개 이상의 카테고리로 묶어줘.
      - 최종 결과는 반드시 아래와 같은 JSON 형식으로만 응답해야 하며, 그 외의 설명이나 부가 텍스트는 절대 포함하면 안 돼.
      - 생성할 퀴즈의 총 개수는 최대한 많이 빠지는 내용 없이 해줘.

      [JSON 형식 예시]
      {
        "카테고리 이름 1": [
          {
            "question": "문제 내용...",
            "answer": "답"
          }
        ]
      }

`;

        const result = await model.generateContent([
            {
                inlineData: {                // ✅ camelCase
                    mimeType: "application/pdf", // ✅ camelCase
                    data: buffer.toString("base64"),
                },
            },
            prompt,
        ]);

        const aiText = result.response.text();

        // JSON 블록 추출
        const match = aiText.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
        if (!match)
            return NextResponse.json(
                { error: "AI가 유효한 퀴즈를 생성하지 못했습니다." },
                { status: 500 },
            );

        const quizData: QuizData = JSON.parse(match[1] || match[2]);
        if (!Object.keys(quizData).length)
            throw new Error("Generated quiz data is empty.");

        // ✅ AI가 생성한 퀴즈를 데이터베이스에 저장
        const newQuiz = await prisma.quiz.create({
            data: {
                title: file.name.replace(".pdf", "") + " 퀴즈", // 파일 이름을 기반으로 제목 생성
                quizData: quizData, // JSON 형식으로 저장
                isShared: false, // 기본적으로 비공개
                userId: userId, // userId 추가
            },
        });

        return NextResponse.json({ quizData, quizId: newQuiz.id }); // 새로 생성된 퀴즈 ID 반환
    } catch (err: any) {
        console.error("Error in generate-quiz API:", err);
        return NextResponse.json(
            { error: err.message ?? "퀴즈 생성 중 오류가 발생했습니다." },
            { status: 500 },
        );
    }
}