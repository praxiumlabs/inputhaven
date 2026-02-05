import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
    AUTH_GITHUB_ID: !!process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: !!process.env.AUTH_GITHUB_SECRET,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    GOOGLE_ID_LENGTH: process.env.AUTH_GOOGLE_ID?.length ?? 0,
    GITHUB_ID_LENGTH: process.env.AUTH_GITHUB_ID?.length ?? 0,
  });
}
