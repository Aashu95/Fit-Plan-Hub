import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    let feed = [];

    if (userRole === "USER") {
      // Get trainers that user follows
      const followedTrainers = await db.follow.findMany({
        where: { followerId: userId },
        select: { trainerId: true },
      });

      const trainerIds = followedTrainers.map((f) => f.trainerId);

      if (trainerIds.length > 0) {
        // Get plans from followed trainers
        feed = await db.fitnessPlan.findMany({
          where: {
            trainerId: { in: trainerIds },
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
            subscriptions: {
              where: { userId },
              select: { id: true, status: true },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      // Also get user's subscribed plans
      const subscribedPlans = await db.subscription.findMany({
        where: { userId },
        include: {
          plan: {
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
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        followedPlans: feed,
        subscribedPlans: subscribedPlans.map((sub) => sub.plan),
      });
    } else if (userRole === "TRAINER") {
      // Trainers see their own plans and subscription stats
      feed = await db.fitnessPlan.findMany({
        where: { trainerId: userId },
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          subscriptions: {
            select: { id: true, status: true, createdAt: true },
          },
          _count: {
            select: { subscriptions: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        myPlans: feed,
      });
    }
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
