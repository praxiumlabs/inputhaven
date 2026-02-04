import { verifyEmail } from "@/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  let token: string | undefined;
  try {
    const params = await searchParams;
    token = params.token;
  } catch {
    token = undefined;
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Invalid Link</CardTitle>
          <CardDescription>This verification link is invalid.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  let result: { error?: string; success?: boolean };
  try {
    result = await verifyEmail(token);
  } catch {
    result = { error: "Something went wrong. Please try again later." };
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{result.error ? "Verification Failed" : "Email Verified"}</CardTitle>
        <CardDescription>
          {result.error || "Your email has been verified. You can now sign in."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Link href="/login" className="text-primary hover:underline">
          Go to login
        </Link>
      </CardContent>
    </Card>
  );
}
