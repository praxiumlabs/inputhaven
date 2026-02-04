import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submission Received",
};

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Thank you!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your submission has been received. We&apos;ll get back to you soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
