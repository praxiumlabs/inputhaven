import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";
import Stripe from "stripe";

function getPlanFromPriceId(priceId: string): Plan {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID || priceId === process.env.STRIPE_STARTER_YEARLY_PRICE_ID) return Plan.STARTER;
  if (priceId === process.env.STRIPE_PRO_PRICE_ID || priceId === process.env.STRIPE_PRO_YEARLY_PRICE_ID) return Plan.PRO;
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID || priceId === process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID) return Plan.ENTERPRISE;
  return Plan.FREE;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string;

      if (userId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id || "";
        const plan = getPlanFromPriceId(priceId);

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: session.customer as string,
          },
        });

        await prisma.auditLog.create({
          data: {
            userId,
            action: "billing.subscribed",
            details: { plan, priceId },
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id || "";
      const plan = getPlanFromPriceId(priceId);

      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { plan },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: Plan.FREE,
            stripeSubscriptionId: null,
          },
        });

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "billing.canceled",
          },
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (user) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "billing.payment_failed",
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
