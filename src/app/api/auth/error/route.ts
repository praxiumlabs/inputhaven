import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const error = req.nextUrl.searchParams.get("error");
  return NextResponse.json({
    error,
    timestamp: new Date().toISOString(),
    hint: "This is a debug endpoint. Check the error type.",
  });
}
