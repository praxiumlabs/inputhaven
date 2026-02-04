import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/plans";
import { Plan } from "@prisma/client";
import { FileText, Inbox, Eye, BarChart3 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, name: true },
  });

  if (!user) redirect("/login");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [formCount, totalSubmissions, monthlySubmissions, unreadCount, recentForms] =
    await Promise.all([
      prisma.form.count({ where: { userId: session.user.id } }),
      prisma.submission.count({
        where: { form: { userId: session.user.id }, isSpam: false },
      }),
      prisma.submission.count({
        where: {
          form: { userId: session.user.id },
          createdAt: { gte: startOfMonth },
          isSpam: false,
        },
      }),
      prisma.submission.count({
        where: {
          form: { userId: session.user.id },
          isRead: false,
          isSpam: false,
        },
      }),
      prisma.form.findMany({
        where: { userId: session.user.id },
        include: { _count: { select: { submissions: true } } },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

  const planConfig = PLANS[user.plan as Plan];
  const usagePercent = Math.min(
    (monthlySubmissions / planConfig.submissionsPerMonth) * 100,
    100
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your forms and submissions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formCount}</div>
            <p className="text-xs text-muted-foreground">
              {planConfig.maxForms === Infinity ? "Unlimited" : `${planConfig.maxForms} max`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Submissions
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlySubmissions}</div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {monthlySubmissions} / {planConfig.submissionsPerMonth.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Forms</CardTitle>
        </CardHeader>
        <CardContent>
          {recentForms.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No forms yet.</p>
              <Link
                href="/dashboard/forms/new"
                className="mt-2 inline-block text-sm text-primary hover:underline"
              >
                Create your first form
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentForms.map((form) => (
                <Link
                  key={form.id}
                  href={`/dashboard/forms/${form.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{form.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {form.emailTo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {form._count.submissions} submissions
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
