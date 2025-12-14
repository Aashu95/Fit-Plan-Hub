import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "USER") {
      return NextResponse.json(
        { error: "Only users can follow trainers" },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    // const userRole = session.user.role // Checked above

    const { trainerId } = await request.json();

    if (!trainerId) {
      return NextResponse.json(
        { error: "Trainer ID is required" },
        { status: 400 }
      );
    }

    // Check if trainer exists and is actually a trainer
    const trainer = await db.user.findUnique({
      where: { id: trainerId },
    });

    if (!trainer || trainer.role !== "TRAINER") {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_trainerId: {
          followerId: userId,
          trainerId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this trainer" },
        { status: 409 }
      );
    }

    // Create follow relationship
    const follow = await db.follow.create({
      data: {
        followerId: userId,
        trainerId,
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
      message: "Successfully followed trainer",
      follow,
    });
  } catch (error) {
    console.error("Error following trainer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId || userRole !== "USER") {
      return NextResponse.json(
        { error: "Only users can unfollow trainers" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const trainerId = searchParams.get("trainerId");

    if (!trainerId) {
      return NextResponse.json(
        { error: "Trainer ID is required" },
        { status: 400 }
      );
    }

    // Check if follow relationship exists
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_trainerId: {
          followerId: userId,
          trainerId,
        },
      },
    });

    if (!existingFollow) {
      return NextResponse.json(
        { error: "Not following this trainer" },
        { status: 404 }
      );
    }

    // Delete follow relationship
    await db.follow.delete({
      where: {
        followerId_trainerId: {
          followerId: userId,
          trainerId,
        },
      },
    });

    return NextResponse.json({
      message: "Successfully unfollowed trainer",
    });
  } catch (error) {
    console.error("Error unfollowing trainer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
