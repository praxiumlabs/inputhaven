import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { Settings, Download, Wand2 } from "lucide-react";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Form Details",
};

export default async function FormDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { formId } = await params;
  const { page: pageStr, search } = await searchParams;
  const page = parseInt(pageStr || "1");

  const form = await prisma.form.findFirst({
    where: { id: formId, userId: session.user.id },
  });

  if (!form) notFound();

  const pageSize = 20;
  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where: { formId, isSpam: false },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        files: { select: { id: true, fileName: true, fileSize: true } },
      },
    }),
    prisma.submission.count({ where: { formId, isSpam: false } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const submitUrl = `${appUrl}/api/v1/submit`;

  const codeSnippet = `<form action="${submitUrl}" method="POST">
  <input type="hidden" name="_form_id" value="${form.accessKey}" />
  ${form.honeypotField ? `<input type="hidden" name="${form.honeypotField}" style="display:none" />` : ""}
  <input type="text" name="name" placeholder="Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
</form>`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{form.name}</h1>
            <Badge variant={form.isActive ? "default" : "secondary"}>
              {form.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{form.emailTo}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/forms/${form.id}/builder`}>
              <Wand2 className="mr-2 h-4 w-4" />
              Builder
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/forms/${form.id}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Integration Code</span>
            <CopyButton text={codeSnippet} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
            <code>{codeSnippet}</code>
          </pre>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Form ID:</span>
            <code className="rounded bg-muted px-2 py-1">{form.accessKey}</code>
            <CopyButton text={form.accessKey} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Submissions ({total})</span>
            {total > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/api/v1/download/${form.id}?format=csv`}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Link>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionsTable
            submissions={submissions}
            formId={formId}
            page={page}
            totalPages={totalPages}
            search={search}
          />
        </CardContent>
      </Card>
    </div>
  );
}
