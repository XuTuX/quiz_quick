import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const { userId } = await auth();
    console.log("[API_USER_TICKETS] userId:", userId);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
    });

    if (!userProfile) {
      userProfile = await prisma.userProfile.create({
        data: {
          clerkUserId: userId,
          ticketBalance: 0,
        },
      });
    }

    return NextResponse.json({ ticketBalance: userProfile.ticketBalance });
  } catch (error) {
    console.error("[API_USER_TICKETS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { ticketsToAdd } = await req.json();

    if (typeof ticketsToAdd !== 'number' || ticketsToAdd <= 0) {
      return new NextResponse("Invalid ticketsToAdd value", { status: 400 });
    }

    let userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
    });

    if (!userProfile) {
      userProfile = await prisma.userProfile.create({
        data: {
          clerkUserId: userId,
          ticketBalance: ticketsToAdd,
        },
      });
    } else {
      userProfile = await prisma.userProfile.update({
        where: { clerkUserId: userId },
        data: {
          ticketBalance: {
            increment: ticketsToAdd,
          },
        },
      });
    }

    revalidatePath("/user/profile");
    return NextResponse.json({ ticketBalance: userProfile.ticketBalance });
  } catch (error) {
    console.error("[API_USER_TICKETS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}