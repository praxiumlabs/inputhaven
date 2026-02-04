import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { signWebhookPayload } from "@/lib/security";
import { logger } from "@/lib/logger";

interface WebhookPayload {
  event: string;
  formId: string;
  submissionId: string;
  data: Record<string, unknown>;
  createdAt: string;
}

const RETRY_DELAYS = [0, 1000, 5000]; // immediate, 1s, 5s
const MAX_ATTEMPTS = 3;

export async function deliverWebhook(
  formId: string,
  webhookUrl: string,
  webhookSecret: string | null,
  payload: WebhookPayload
) {
  const body = JSON.stringify(payload);
  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "InputHaven-Webhook/1.0",
  };

  if (webhookSecret) {
    reqHeaders["X-InputHaven-Signature"] = signWebhookPayload(body, webhookSecret);
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
    }

    const startTime = Date.now();
    let responseCode: number | null = null;
    let responseBody: string | null = null;
    let success = false;
    let error: string | null = null;

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: reqHeaders,
        body,
        signal: AbortSignal.timeout(10000),
      });

      responseCode = response.status;
      responseBody = await response.text().catch(() => null);
      success = response.ok;
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error";
    }

    const durationMs = Date.now() - startTime;

    await prisma.webhookLog.create({
      data: {
        formId,
        url: webhookUrl,
        requestBody: payload as unknown as Prisma.JsonObject,
        responseCode,
        responseBody,
        durationMs,
        success,
        error,
      },
    });

    if (success) {
      logger.info("Webhook delivered", {
        formId,
        url: webhookUrl,
        attempt: attempt + 1,
        responseCode,
      });
      return { success: true, responseCode, error: null };
    }

    logger.warn("Webhook delivery failed", {
      formId,
      url: webhookUrl,
      attempt: attempt + 1,
      responseCode,
      error,
    });
  }

  return { success: false, responseCode: null, error: "All retry attempts exhausted" };
}
