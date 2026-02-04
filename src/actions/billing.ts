"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initLemonSqueezy } from "@/lib/lemonsqueezy";
import { PLANS } from "@/lib/plans";
import { Plan } from "@prisma/client";
import { absoluteUrl } from "@/lib/utils";
import {
  createCheckout,
  getSubscription,
} from "@lemonsqueezy/lemonsqueezy.js";

export async function createCheckoutSession(plan: Plan, yearly = false) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return { error: "User not found" };

  const planConfig = PLANS[plan];
  const variantId = yearly ? planConfig.yearlyVariantId : planConfig.variantId;

  if (!variantId) return { error: "Invalid plan" };

  initLemonSqueezy();

  const { data, error } = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    variantId,
    {
      checkoutData: {
        email: user.email,
        custom: { user_id: user.id },
      },
      productOptions: {
        redirectUrl: absoluteUrl("/dashboard/billing?success=true"),
      },
    }
  );

  if (error || !data) return { error: "Failed to create checkout" };

  return { url: data.data.attributes.url };
}

export async function createPortalSession() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.lemonSqueezySubscriptionId) {
    return { error: "No billing account found" };
  }

  initLemonSqueezy();

  const { data, error } = await getSubscription(
    user.lemonSqueezySubscriptionId
  );

  if (error || !data) return { error: "Subscription not found" };

  const portalUrl =
    data.data.attributes.urls.customer_portal;

  if (!portalUrl) return { error: "Portal URL not available" };

  return { url: portalUrl };
}

export async function getBillingInfo() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      lemonSqueezyCustomerId: true,
      lemonSqueezySubscriptionId: true,
    },
  });

  if (!user) return null;

  let subscription = null;
  if (user.lemonSqueezySubscriptionId) {
    try {
      initLemonSqueezy();
      const { data } = await getSubscription(
        user.lemonSqueezySubscriptionId
      );

      if (data) {
        const attrs = data.data.attributes;
        subscription = {
          status: attrs.status,
          currentPeriodEnd: attrs.renews_at,
          cancelAtPeriodEnd: attrs.cancelled,
        };
      }
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
    subscription,
  };
}
