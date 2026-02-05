import { NextRequest, NextResponse } from "next/server";
import { register } from "@/actions/auth";
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
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = await register(body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
