import { NextRequest, NextResponse } from "next/server";
import { retryFailedEmails } from "@/lib/email-retry";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await retryFailedEmails();
    logger.info("Cron email retry completed", result);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    logger.error("Cron email retry failed", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
