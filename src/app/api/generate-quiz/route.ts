import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QuizData } from "@/lib/types";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import JSON5 from 'json5';  // 새로 추가


export const runtime = "nodejs";
export const preferredRegion = "iad1";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch or create UserProfile and check ticket balance
        let userProfile = await prisma.userProfile.findUnique({
            where: { clerkUserId: userId },
        });

        if (!userProfile) {
            userProfile = await prisma.userProfile.create({
                data: {
                    clerkUserId: userId,
                    ticketBalance: 0, // Default for new users
                },
            });
        }

        if (userProfile.ticketBalance < 1) {
            return new NextResponse("Not enough tickets. Please purchase more.", { status: 403 });
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
        if (file.size > 15 * 1024 * 1024)
            return NextResponse.json(
                { error: "파일 크기는 15 MB를 초과할 수 없습니다." },
                { status: 400 },
            );

        const buffer = Buffer.from(await file.arrayBuffer());

        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
        });

        const prompt = `
너는 제공된 텍스트를 기반으로 학습용 퀴즈를 최대한 상세히 만들어야 한다.

조건:
1. 퀴즈는 중요한 내용을 빠짐없이 포함하며, 문서의 핵심 개념과 세부 내용까지 반영한다.
2. 전체 퀴즈 수는 가능한 한 많게 작성한다.
3. 질문은 "question" 필드에, 정답은 "answer" 필드에 담는다.
4. 질문은 반드시 **하나의 정답**만 가지며, 주관식(단답형 또는 완성형)으로 작성한다.
5. 같은 개념이라도 질문 문장이 완전히 동일하지 않도록 한다.
6. 질문 유형은 용어 정의형, 빈칸 완성형, 원인·결과형으로한다.
※ [유형별 문제 예시]
 - 입력 텍스트: 장강: 꼬리뼈 끝과 항문 사이의 중점이고 주로 치질 치료에 쓰인다.
- **용어 정의형 예시**
  - question: "꼬리뼈 끝과 항문 사이의 중점을 지칭하는 경혈은?"
    answer: "장강"

- **빈칸 완성형 예시**
  - question: "장강의 위치는 ___와 ___ 사이의 중점이다."
    answer: "꼬리뼈 끝과 항문"

- **원인·결과형 예시**
  - question: "장강은 주로 어떤 질환 치료에 쓰이는가?"
    answer: "치질"
7. 정답은 문장형이 아니라 핵심 단어/구절로만 작성한다."정답 예시: 'ATP 생성', '미토콘드리아', '산화적 인산화'"
8. 전체 퀴즈를 1개 이상의 카테고리(장·절·목차 등)에 따라 구조화한다.
9. 카테고리 내 문제는 순서에 맞춰 정렬한다.
10. 출력 형식:
    - JSON 외의 다른 텍스트, 설명, 인사말은 절대 포함하지 않는다.
    - 최상위에 title(퀴즈 제목)과 hashtags(주제를 나타내는 해시태그 3개 배열)를 포함한다.
    - 이후 각 카테고리 이름을 키로 하여 문제 배열을 넣는다.
11. 출력 JSON은 UTF-8 인코딩을 가정한다.
12. 작성할 수 있는 모든 퀴즈를 최대한 빠짐없이 생성한다.
[출력 JSON 형식 예시]
{
  "title": "퀴즈 제목",
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3"],
  "카테고리 이름 1": [
    {
      "question": "문제 내용...",
      "answer": "정답"
    },
    {
      "question": "문제 내용...",
      "answer": "정답"
    }
  ],
  "카테고리 이름 2": [
    {
      "question": "문제 내용...",
      "answer": "정답"
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
        console.log("AI Raw Text:", aiText); // 추가된 로깅

        // JSON 블록 추출
        const match = aiText.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
        console.log("Regex Match Result:", match); // 추가된 로깅
        if (!match)
            return NextResponse.json(
                { error: "AI가 유효한 퀴즈를 생성하지 못했습니다." },
                { status: 500 },
            );

        let rawJson = match[1] || match[2];
        console.log("Extracted rawJson:", rawJson); // 추가된 로깅

        let quizData: QuizData & { title: string; hashtags: string[] };
        try {
            quizData = JSON5.parse(rawJson);
        } catch (e) {
            console.error("JSON5 파싱 오류:", e, rawJson);
            return NextResponse.json(
                { error: "AI가 생성한 JSON 형식이 유효하지 않습니다." },
                { status: 500 },
            );
        }

        if (!Object.keys(quizData).length) // quizData 객체에 카테고리가 있는지 확인
            throw new Error("Generated quiz data is empty.");

        const { title, hashtags, ...categories } = quizData;

        // Decrement ticket balance after successful quiz generation
        await prisma.userProfile.update({
            where: { clerkUserId: userId },
            data: { ticketBalance: { decrement: 1 } },
        });

        const newQuiz = await prisma.quiz.create({
            data: {
                title: title.normalize('NFC'),
                quizData: categories,
                isShared: false,
                userId: userId,
                hashtags: hashtags,
            },
        });

        const usageMetadata = result.response.usageMetadata;
        const promptTokenCount = usageMetadata?.promptTokenCount || 0;
        const candidatesTokenCount = usageMetadata?.candidatesTokenCount || 0;

        console.log("Gemini 사용량:", usageMetadata);

        return NextResponse.json({
            quizData,
            quizId: newQuiz.id,
            tokenUsage: {
                promptTokens: promptTokenCount,
                completionTokens: candidatesTokenCount,
            },
        });
    } catch (err: any) {
        console.error("Error in generate-quiz API:", err);
        return NextResponse.json(
            { error: err.message ?? "퀴즈 생성 중 오류가 발생했습니다." },
            { status: 500 },
        );
    }
}
