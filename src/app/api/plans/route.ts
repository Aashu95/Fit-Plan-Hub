import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trainerId = searchParams.get("trainerId");
    const userId = searchParams.get("userId");

    let whereClause = {};

    if (trainerId) {
      whereClause = { trainerId };
    }

    const plans = await db.fitnessPlan.findMany({
      where: whereClause,
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        subscriptions: userId
          ? {
              where: { userId },
              select: { id: true, status: true },
            }
          : false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "TRAINER") {
      return NextResponse.json(
        { error: "Only trainers can create fitness plans" },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    const { title, description, price, duration } = await request.json();

    if (!title || !description || !price || !duration) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const plan = await db.fitnessPlan.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        trainerId: userId,
      },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Plan created successfully",
      plan,
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
