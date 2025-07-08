import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { nickname } = await req.json();

    if (!nickname || typeof nickname !== "string" || nickname.trim() === "") {
      return new NextResponse("Invalid nickname", { status: 400 });
    }

    // UserProfile이 없으면 생성, 있으면 업데이트
    const userProfile = await prisma.userProfile.upsert({
      where: { clerkUserId: userId },
      update: { nickname: nickname.trim() },
      create: {
        clerkUserId: userId,
        nickname: nickname.trim(),
      },
    });

    return NextResponse.json({ userProfile });
  } catch (error: any) {
    console.error("Error setting nickname:", error);
    return NextResponse.json(
      { error: error.message ?? "닉네임 설정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
