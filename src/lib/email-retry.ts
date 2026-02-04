import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { logger } from "@/lib/logger";
import { buildSubmissionEmailHtml } from "@/lib/email-template";

function getBackoffDelay(attempts: number): number {
  const delays = [60_000, 300_000, 1_800_000]; // 1min, 5min, 30min
  return delays[Math.min(attempts, delays.length - 1)] ?? 1_800_000;
}

export function getNextRetryAt(attempts: number): Date {
  return new Date(Date.now() + getBackoffDelay(attempts));
}

export async function retryFailedEmails(): Promise<{ retried: number; failed: number }> {
  const emails = await prisma.emailQueue.findMany({
    where: {
      status: "PENDING",
      attempts: { lt: 3 },
      OR: [
        { nextRetryAt: null },
        { nextRetryAt: { lte: new Date() } },
      ],
    },
    include: {
      submission: {
        include: {
          form: true,
        },
      },
    },
    take: 50,
  });

  let retried = 0;
  let failed = 0;

  for (const email of emails) {
    try {
      const form = email.submission.form;
      const submissionData = email.submission.data as Record<string, unknown>;

      const emailBody = buildSubmissionEmailHtml(
        form.name,
        submissionData,
        email.submission.createdAt.toISOString()
      );

      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || "InputHaven <noreply@inputhaven.com>",
        to: email.to,
        subject: email.subject,
        html: emailBody,
      });

      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          status: "SENT",
          resendId: result.data?.id,
          sentAt: new Date(),
          attempts: { increment: 1 },
        },
      });

      retried++;
      logger.info("Email retry succeeded", { emailId: email.id, to: email.to });
    } catch (err) {
      const newAttempts = email.attempts + 1;
      const isFinalAttempt = newAttempts >= 3;

      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          status: isFinalAttempt ? "FAILED" : "PENDING",
          error: err instanceof Error ? err.message : "Unknown error",
          attempts: { increment: 1 },
          nextRetryAt: isFinalAttempt ? null : getNextRetryAt(newAttempts - 1),
        },
      });

      failed++;
      logger.warn("Email retry failed", {
        emailId: email.id,
        to: email.to,
        attempts: newAttempts,
        permanent: isFinalAttempt,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return { retried, failed };
}
