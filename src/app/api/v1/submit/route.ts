import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { submissionRateLimit } from "@/lib/rate-limit";
import { submissionFallback } from "@/lib/rate-limit-fallback";
import { checkSpamEnhanced, checkHoneypot } from "@/lib/spam";
import { resend } from "@/lib/resend";
import { isWithinSubmissionLimit } from "@/lib/plans";
import { deliverWebhook } from "@/lib/webhook";
import { evaluateRoutes, type EmailRoute } from "@/lib/email-routing";
import { Plan } from "@prisma/client";
import { logger } from "@/lib/logger";
import { getNextRetryAt } from "@/lib/email-retry";
import { buildSubmissionEmailHtml } from "@/lib/email-template";
import { redis } from "@/lib/redis";
import { getClientIp } from "@/lib/utils";
import crypto from "crypto";

const MAX_JSON_SIZE = 64 * 1024; // 64KB
const MAX_FIELDS = 100;
const MAX_FIELD_VALUE_SIZE = 10 * 1024; // 10KB

function corsHeaders(origin: string | null, allowedDomains: string[]) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (allowedDomains.length === 0) {
    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    if (!origin || origin === "null") {
      headers["Access-Control-Allow-Origin"] = appOrigin;
    } else if (origin === new URL(appOrigin).origin) {
      headers["Access-Control-Allow-Origin"] = origin;
    }
  } else if (origin) {
    try {
      const originHost = new URL(origin).hostname;
      if (allowedDomains.some((d) => originHost === d || originHost.endsWith(`.${d}`))) {
        headers["Access-Control-Allow-Origin"] = origin;
      }
    } catch {
      // Invalid origin
    }
  }

  return headers;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin"), []),
  });
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const ip = getClientIp(request);
  const origin = request.headers.get("origin");

  // Rate limit
  try {
    const { success } = await submissionRateLimit.limit(ip);
    if (!success) {
      logger.warn("Rate limit exceeded", { requestId, ip });
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "X-Request-Id": requestId } }
      );
    }
  } catch (err) {
    logger.error("Redis rate limit failed, using in-memory fallback", {
      requestId,
      error: err instanceof Error ? err.message : "Unknown error",
    });
    const { success } = submissionFallback.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "X-Request-Id": requestId } }
      );
    }
  }

  // Parse body (support both JSON and form-encoded)
  let data: Record<string, unknown>;
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const text = await request.text();
      if (text.length > MAX_JSON_SIZE) {
        return NextResponse.json(
          { error: "Request body too large" },
          { status: 413, headers: { "X-Request-Id": requestId } }
        );
      }
      data = JSON.parse(text);
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      data = {};
      let fieldCount = 0;
      for (const [key, value] of formData.entries()) {
        if (++fieldCount > MAX_FIELDS) {
          return NextResponse.json(
            { error: "Too many form fields" },
            { status: 413, headers: { "X-Request-Id": requestId } }
          );
        }
        if (typeof value === "string") {
          if (value.length > MAX_FIELD_VALUE_SIZE) {
            return NextResponse.json(
              { error: `Field "${key}" value too large` },
              { status: 413, headers: { "X-Request-Id": requestId } }
            );
          }
          data[key] = value;
        }
      }
    } else {
      // application/x-www-form-urlencoded
      const text = await request.text();
      if (text.length > MAX_JSON_SIZE) {
        return NextResponse.json(
          { error: "Request body too large" },
          { status: 413, headers: { "X-Request-Id": requestId } }
        );
      }
      const params = new URLSearchParams(text);
      data = {};
      let fieldCount = 0;
      for (const [key, value] of params.entries()) {
        if (++fieldCount > MAX_FIELDS) {
          return NextResponse.json(
            { error: "Too many form fields" },
            { status: 413, headers: { "X-Request-Id": requestId } }
          );
        }
        if (value.length > MAX_FIELD_VALUE_SIZE) {
          return NextResponse.json(
            { error: `Field "${key}" value too large` },
            { status: 413, headers: { "X-Request-Id": requestId } }
          );
        }
        data[key] = value;
      }
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers: { "X-Request-Id": requestId } }
    );
  }

  // Extract form ID (also accepts legacy _access_key)
  const accessKey =
    (data._form_id as string) ||
    (data._access_key as string) ||
    (data.access_key as string) ||
    (data._accessKey as string) ||
    request.headers.get("x-form-id") ||
    request.headers.get("x-access-key") ||
    "";

  if (!accessKey) {
    return NextResponse.json(
      { error: "Form ID is required. Add a hidden field named '_form_id' with your form's ID." },
      { status: 400, headers: { "X-Request-Id": requestId } }
    );
  }

  // Find form
  const form = await prisma.form.findUnique({
    where: { accessKey },
    include: { user: { select: { id: true, plan: true } } },
  });

  if (!form || !form.isActive) {
    return NextResponse.json(
      { error: "Invalid access key" },
      { status: 404, headers: { "X-Request-Id": requestId } }
    );
  }

  const headers = corsHeaders(origin, form.allowedDomains);
  headers["X-Request-Id"] = requestId;

  // Server-side origin enforcement
  // When an Origin header is present (browser request), verify it's allowed.
  // Requests without Origin (cURL, server-to-server) are permitted — use API keys for those.
  if (origin) {
    if (!headers["Access-Control-Allow-Origin"]) {
      return NextResponse.json(
        { error: "Origin not allowed" },
        { status: 403, headers }
      );
    }
  }

  // Atomic submission limit check — use Redis INCR to reserve a slot atomically
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthKey = `submissions:${form.userId}:${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  let reservedSlot = false;

  try {
    // Seed the counter from DB if it doesn't exist yet
    const exists = await redis.exists(monthKey);
    if (!exists) {
      const dbCount = await prisma.submission.count({
        where: {
          form: { userId: form.userId },
          createdAt: { gte: startOfMonth },
          isSpam: false,
        },
      });
      const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
      const ttlSeconds = Math.ceil((endOfMonth.getTime() - now.getTime()) / 1000) + 86400;
      // SET NX to avoid overwriting if another request seeded between our EXISTS and SET
      await redis.set(monthKey, dbCount, { ex: ttlSeconds, nx: true });
    }

    // Atomically increment and check
    const newCount = await redis.incr(monthKey);
    reservedSlot = true;

    if (!isWithinSubmissionLimit(form.user.plan as Plan, newCount - 1)) {
      // Over limit — rollback the reservation
      await redis.decr(monthKey);
      reservedSlot = false;
      return NextResponse.json(
        { error: "Monthly submission limit reached" },
        { status: 429, headers }
      );
    }
  } catch {
    // Redis unavailable, fall back to DB count (non-atomic but still functional)
    const dbCount = await prisma.submission.count({
      where: {
        form: { userId: form.userId },
        createdAt: { gte: startOfMonth },
        isSpam: false,
      },
    });
    if (!isWithinSubmissionLimit(form.user.plan as Plan, dbCount)) {
      return NextResponse.json(
        { error: "Monthly submission limit reached" },
        { status: 429, headers }
      );
    }
  }

  // Clean data - remove internal fields
  const cleanData = { ...data };
  delete cleanData._form_id;
  delete cleanData._access_key;
  delete cleanData.access_key;
  delete cleanData._accessKey;
  delete cleanData._gotcha; // Common honeypot name
  delete cleanData._redirect;

  // Check honeypot
  if (checkHoneypot(data, form.honeypotField)) {
    // Silently accept but mark as spam
    await prisma.submission.create({
      data: {
        formId: form.id,
        data: cleanData as Prisma.JsonObject,
        ipAddress: ip,
        userAgent: request.headers.get("user-agent"),
        referer: request.headers.get("referer"),
        isSpam: true,
      },
    });
    logger.info("Honeypot triggered", { requestId, formId: form.id });
    return NextResponse.json({ success: true }, { headers });
  }

  // Check spam (keyword + optional AI)
  const useAI = form.aiSpamFilter && form.user.plan !== "FREE";
  const spamResult = await checkSpamEnhanced(cleanData, useAI);

  // Create submission
  const submission = await prisma.submission.create({
    data: {
      formId: form.id,
      data: cleanData as Prisma.JsonObject,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
      isSpam: spamResult.isSpam,
      spamScore: spamResult.spamScore ?? null,
      spamReason: spamResult.reason ?? null,
    },
  });

  // If marked as spam, rollback the reserved slot since spam doesn't count toward limits
  if (spamResult.isSpam && reservedSlot) {
    try {
      await redis.decr(monthKey);
    } catch {
      // Redis unavailable, counter will re-seed from DB next request
    }
  }

  logger.info("Submission created", {
    requestId,
    formId: form.id,
    submissionId: submission.id,
    isSpam: spamResult.isSpam,
    spamMethod: spamResult.method,
  });

  // Send email notification (non-blocking)
  if (!spamResult.isSpam) {
    const emailSubject =
      form.customSubject ||
      `New submission from ${form.name}`;

    const emailBody = buildSubmissionEmailHtml(
      form.name,
      cleanData,
      `${new Date().toISOString()} from ${request.headers.get("referer") || "unknown"}`
    );

    // Determine recipients via email routing (plan-gated)
    const routes = (form.emailRoutes as unknown as EmailRoute[]) || [];
    const useRouting = routes.length > 0 && form.user.plan !== "FREE";
    const recipients = useRouting
      ? evaluateRoutes(cleanData as Record<string, unknown>, routes, form.emailTo)
      : [form.emailTo];

    // Send to each recipient
    for (const recipient of recipients) {
      const emailRecord = await prisma.emailQueue.create({
        data: {
          submissionId: submission.id,
          to: recipient,
          subject: emailSubject,
          status: "PENDING",
        },
      });

      try {
        const result = await resend.emails.send({
          from: process.env.EMAIL_FROM || "InputHaven <noreply@inputhaven.com>",
          to: recipient,
          subject: emailSubject,
          html: emailBody,
        });

        await prisma.emailQueue.update({
          where: { id: emailRecord.id },
          data: {
            status: "SENT",
            resendId: result.data?.id,
            sentAt: new Date(),
            attempts: { increment: 1 },
          },
        });

        logger.info("Email sent", { requestId, emailId: emailRecord.id, to: recipient });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        await prisma.emailQueue.update({
          where: { id: emailRecord.id },
          data: {
            status: "PENDING",
            error: errorMsg,
            attempts: { increment: 1 },
            nextRetryAt: getNextRetryAt(0),
          },
        });
        logger.warn("Email send failed, queued for retry", {
          requestId,
          emailId: emailRecord.id,
          to: recipient,
          error: errorMsg,
        });
      }
    }

    // Deliver webhook if configured
    if (form.webhookUrl) {
      deliverWebhook(form.id, form.webhookUrl, form.webhookSecret, {
        event: "submission.created",
        formId: form.id,
        submissionId: submission.id,
        data: cleanData as Prisma.JsonObject,
        createdAt: submission.createdAt.toISOString(),
      }).catch(() => {
        // Non-blocking webhook delivery
      });
    }
  }

  // Check for redirect (only allow same-origin or allowlisted domains)
  const redirectUrl = data._redirect as string;
  if (redirectUrl && typeof redirectUrl === "string") {
    try {
      const parsed = new URL(redirectUrl);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        // Disallow javascript:, data:, etc.
      } else {
        const redirectOrigin = parsed.origin;
        const appOrigin = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").origin;
        const isAllowed =
          redirectOrigin === appOrigin ||
          (origin && redirectOrigin === new URL(origin).origin) ||
          (form.allowedDomains.length > 0 &&
            form.allowedDomains.some((d) => {
              const host = parsed.hostname;
              return host === d || host.endsWith(`.${d}`);
            }));
        if (isAllowed) {
          return NextResponse.redirect(redirectUrl, { status: 303, headers });
        }
      }
    } catch {
      // Invalid URL, skip redirect
    }
  }

  // Check for AJAX request
  const isAjax =
    request.headers.get("accept")?.includes("application/json") ||
    contentType.includes("application/json") ||
    request.headers.get("x-requested-with") === "XMLHttpRequest";

  if (isAjax) {
    return NextResponse.json(
      { success: true, submissionId: submission.id },
      { headers }
    );
  }

  // Default: redirect to success page
  return NextResponse.redirect(
    new URL("/success", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    { status: 303, headers }
  );
}
