import { NextRequest, NextResponse } from "next/server";
// 🔄 pdf-parse 삭제
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QuizData } from "@/lib/types";

export const runtime = "nodejs";
export const preferredRegion = "iad1";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
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
        if (file.size > 20 * 1024 * 1024)
            return NextResponse.json(
                { error: "파일 크기는 20 MB를 초과할 수 없습니다." },
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
      - 객관식 문제의 경우, 4개의 보기를 "options" 필드에 배열 형태로 포함하고, 정답은 보기 내용과 정확히 일치하는 텍스트로 "answer"에 넣어줘.
      - 주관식 문제도 몇 개 포함해줘. 주관식 문제는 "options" 필드가 없어야 해.
      - 전체 퀴즈를 주제별로 1개 이상의 카테고리로 묶어줘.
      - 최종 결과는 반드시 아래와 같은 JSON 형식으로만 응답해야 하며, 그 외의 설명이나 부가 텍스트는 절대 포함하면 안 돼.
      - 생성할 퀴즈의 총 개수는 5개에서 10개 사이로 해줘.

      [JSON 형식 예시]
      {
        "카테고리 이름 1": [
          {
            "question": "문제 내용...",
            "options": ["보기 1", "보기 2", "보기 3", "보기 4"],
            "answer": "보기 2"
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

        return NextResponse.json({ quizData });
    } catch (err: any) {
        console.error("Error in generate-quiz API:", err);
        return NextResponse.json(
            { error: err.message ?? "퀴즈 생성 중 오류가 발생했습니다." },
            { status: 500 },
        );
    }
}
