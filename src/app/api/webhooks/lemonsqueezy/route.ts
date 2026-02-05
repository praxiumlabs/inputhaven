import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";
import { getPlanFromVariantId } from "@/lib/plans";
import crypto from "crypto";

function verifySignature(rawBody: string, signature: string): boolean {
  const hmac = crypto.createHmac(
    "sha256",
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
  );
  const digest = hmac.update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature);
  const digestBuf = Buffer.from(digest);
  if (sigBuf.length !== digestBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, digestBuf);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const eventName: string = event.meta.event_name;
  const userId: string | undefined = event.meta.custom_data?.user_id;
  const attrs = event.data.attributes;
  const subscriptionId = String(event.data.id);
  const customerId = String(attrs.customer_id);
  const variantId = String(attrs.variant_id);

  switch (eventName) {
    case "subscription_created": {
      if (!userId) break;

      const plan = getPlanFromVariantId(variantId);

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          lemonSqueezySubscriptionId: subscriptionId,
          lemonSqueezyCustomerId: customerId,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: "billing.subscribed",
          details: { plan, variantId },
        },
      });
      break;
    }

    case "subscription_updated": {
      const plan = getPlanFromVariantId(variantId);

      const user = await prisma.user.findFirst({
        where: { lemonSqueezySubscriptionId: subscriptionId },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { plan },
        });
      }
      break;
    }

    case "subscription_cancelled":
    case "subscription_expired": {
      const user = await prisma.user.findFirst({
        where: { lemonSqueezySubscriptionId: subscriptionId },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: Plan.FREE,
            lemonSqueezySubscriptionId: null,
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

    case "subscription_payment_failed": {
      const user = await prisma.user.findFirst({
        where: { lemonSqueezyCustomerId: customerId },
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
