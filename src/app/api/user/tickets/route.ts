import { auth } from "@clerk/nextjs/server";   // ✅ 올바른 경로
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    console.log("[API_USER_TICKETS] userId:", userId); // 디버깅 로그 추가

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
    });

    if (!userProfile) {
      // If user profile doesn't exist, create one with default ticket balance
      userProfile = await prisma.userProfile.create({
        data: {
          clerkUserId: userId,
          ticketBalance: 0, // Default ticket balance for new users
        },
      });
    }

    return NextResponse.json({ ticketBalance: userProfile.ticketBalance });
  } catch (error) {
    console.error("[API_USER_TICKETS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
