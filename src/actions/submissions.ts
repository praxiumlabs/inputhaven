"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSubmissions(
  formId: string,
  page = 1,
  pageSize = 20,
  search?: string
) {
  const session = await auth();
  if (!session?.user?.id) return { submissions: [], total: 0 };

  // Validate pagination bounds
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));

  // Verify form ownership
  const form = await prisma.form.findFirst({
    where: { id: formId, userId: session.user.id },
  });

  if (!form) return { submissions: [], total: 0 };

  const where = {
    formId,
    ...(search
      ? {
          OR: [
            { data: { path: [], string_contains: search } },
          ],
        }
      : {}),
  };

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        files: { select: { id: true, fileName: true, fileSize: true } },
      },
    }),
    prisma.submission.count({ where }),
  ]);

  return { submissions, total };
}

export async function markSubmissionRead(submissionId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, form: { userId: session.user.id } },
  });

  if (!submission) return { error: "Submission not found" };

  await prisma.submission.update({
    where: { id: submissionId },
    data: { isRead: true },
  });

  revalidatePath(`/dashboard/forms/${submission.formId}`);
  return { success: true };
}

export async function deleteSubmission(submissionId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, form: { userId: session.user.id } },
  });

  if (!submission) return { error: "Submission not found" };

  await prisma.submission.delete({ where: { id: submissionId } });

  revalidatePath(`/dashboard/forms/${submission.formId}`);
  return { success: true };
}

export async function exportSubmissions(formId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const form = await prisma.form.findFirst({
    where: { id: formId, userId: session.user.id },
  });

  if (!form) return { error: "Form not found" };

  const EXPORT_LIMIT = 10_000;
  const submissions = await prisma.submission.findMany({
    where: { formId, isSpam: false },
    orderBy: { createdAt: "desc" },
    take: EXPORT_LIMIT,
  });

  // Build CSV
  if (submissions.length === 0) return { csv: "", filename: `${form.name}-submissions.csv` };

  const allKeys = new Set<string>();
  submissions.forEach((sub) => {
    const data = sub.data as Record<string, unknown>;
    Object.keys(data).forEach((key) => allKeys.add(key));
  });

  const headers = ["id", "createdAt", ...Array.from(allKeys)];
  const rows = submissions.map((sub) => {
    const data = sub.data as Record<string, unknown>;
    return headers.map((header) => {
      if (header === "id") return sub.id;
      if (header === "createdAt") return sub.createdAt.toISOString();
      const val = data[header];
      let str = String(val ?? "");
      // CSV injection protection: prefix formula-triggering characters
      if (/^[=+\-@]/.test(str)) {
        str = "'" + str;
      }
      // Escape CSV
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
  });

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return {
    csv,
    filename: `${form.name}-submissions.csv`,
    truncated: submissions.length === EXPORT_LIMIT,
  };
}
