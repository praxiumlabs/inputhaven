import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const testId = `test-${Date.now()}`;
  try {
    // Test 1: Create user (like PrismaAdapter does)
    const user = await prisma.user.create({
      data: {
        email: `${testId}@test.com`,
        name: "Test OAuth User",
        emailVerified: new Date(),
        image: "https://example.com/photo.jpg",
      },
    });

    // Test 2: Create account (like PrismaAdapter does for Google)
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        type: "oidc",
        provider: "google",
        providerAccountId: testId,
        access_token: "test_token",
        token_type: "Bearer",
        scope: "openid profile email",
        id_token: "test_id_token",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      },
    });

    // Cleanup
    await prisma.account.delete({ where: { id: account.id } });
    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json({ success: true, user: user.id, account: account.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const name = error instanceof Error ? error.name : "Unknown";
    return NextResponse.json({ success: false, error: name, message }, { status: 500 });
  }
}
