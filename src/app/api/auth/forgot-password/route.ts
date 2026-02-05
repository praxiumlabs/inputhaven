import { NextRequest, NextResponse } from "next/server";
import { forgotPassword } from "@/actions/auth";
import { authRateLimit } from "@/lib/rate-limit";
import { authFallback } from "@/lib/rate-limit-fallback";
import { getClientIp } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    const { success } = await authRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  } catch {
    const { success } = authFallback.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await forgotPassword(body);
  // Always return success to prevent user enumeration
  return NextResponse.json({ success: true });
}
