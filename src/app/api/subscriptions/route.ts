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

    // ... rest of GET is mostly fine, just imports were missing

    let subscriptions;

    if (userRole === "TRAINER") {
      // Trainers can see subscriptions for their plans
      subscriptions = await db.subscription.findMany({
        where: {
          plan: {
            trainerId: userId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          plan: {
            select: {
              id: true,
              title: true,
              price: true,
              duration: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // Users can see their own subscriptions
      subscriptions = await db.subscription.findMany({
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
                  // ...
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "USER") {
      return NextResponse.json(
        { error: "Only users can subscribe to plans" },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const plan = await db.fitnessPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Check if already subscribed
    const existingSubscription = await db.subscription.findUnique({
      where: {
        userId_planId: {
          userId,
          planId,
        },
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "Already subscribed to this plan" },
        { status: 409 }
      );
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.title,
              description: plan.description,
            },
            unit_amount: Math.round(plan.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?canceled=true`,
      metadata: {
        userId,
        planId,
      },
      client_reference_id: userId,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
