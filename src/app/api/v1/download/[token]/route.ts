import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/r2";
import { apiRateLimit } from "@/lib/rate-limit";
import { apiFallback } from "@/lib/rate-limit-fallback";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  try {
    const { success } = await apiRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  } catch (err) {
    logger.error("Redis rate limit failed, using in-memory fallback", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    const { success } = apiFallback.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  const { token } = await params;

  if (!token || typeof token !== "string" || token.length > 200) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const file = await prisma.fileUpload.findUnique({
    where: { downloadToken: token },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const url = await getSignedDownloadUrl(file.r2Key);
  return NextResponse.redirect(url);
}
