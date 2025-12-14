import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session?.metadata?.userId || !session?.metadata?.planId) {
      return NextResponse.json(
        { error: "Webhook Error: Missing metadata" },
        { status: 400 }
      );
    }

    await db.subscription.create({
      data: {
        userId: session.metadata.userId,
        planId: session.metadata.planId,
        status: "active", // You might want to map Stripe status here
        // stripeSubscriptionId: subscription.id, // If you add this field to schema
        // stripeCustomerId: session.customer as string,
      },
    });
  }

  return NextResponse.json({ received: true });
}
