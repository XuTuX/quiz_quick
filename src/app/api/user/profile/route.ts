import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
    });

    return NextResponse.json({ userProfile });
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: error.message ?? "사용자 프로필을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
