"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { PLANS } from "@/lib/plans";
import { Plan } from "@prisma/client";
import { absoluteUrl } from "@/lib/utils";

export async function createCheckoutSession(plan: Plan, yearly = false) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return { error: "User not found" };

  const planConfig = PLANS[plan];
  const priceId = yearly ? planConfig.stripeYearlyPriceId : planConfig.stripePriceId;

  if (!priceId) return { error: "Invalid plan" };

  // Create or retrieve Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: absoluteUrl("/dashboard/billing?success=true"),
    cancel_url: absoluteUrl("/dashboard/billing?canceled=true"),
    metadata: { userId: user.id, plan },
  });

  return { url: checkoutSession.url };
}

export async function createPortalSession() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.stripeCustomerId) {
    return { error: "No billing account found" };
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: absoluteUrl("/dashboard/billing"),
  });

  return { url: portalSession.url };
}

export async function getBillingInfo() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) return null;

  let subscription = null;
  if (user.stripeSubscriptionId) {
    try {
      subscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId
      );
    } catch {
      // Subscription may have been deleted
    }
  }

  // Get current month submission count
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const submissionCount = await prisma.submission.count({
    where: {
      form: { userId: session.user.id },
      createdAt: { gte: startOfMonth },
      isSpam: false,
    },
  });

  return {
    plan: user.plan,
    planConfig: PLANS[user.plan],
    submissionCount,
    subscription: subscription
      ? {
          status: subscription.status,
          currentPeriodEnd: new Date(
            (subscription as unknown as { current_period_end: number }).current_period_end * 1000
          ).toISOString(),
          cancelAtPeriodEnd: (subscription as unknown as { cancel_at_period_end: boolean }).cancel_at_period_end,
        }
      : null,
  };
}
