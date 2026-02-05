import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  if (!["google", "github"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  try {
    await signIn(provider, { redirectTo: "/dashboard" });
  } catch (error: unknown) {
    // signIn throws NEXT_REDIRECT - must re-throw
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest: string }).digest === "string" &&
      (error as { digest: string }).digest.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }
    // Real error - redirect to login with error
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "OAuthSignin");
    return NextResponse.redirect(url);
  }
}
