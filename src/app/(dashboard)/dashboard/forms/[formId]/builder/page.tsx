import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { FormBuilder } from "@/components/dashboard/form-builder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Form Builder",
};

export default async function FormBuilderPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { formId } = await params;

  const form = await prisma.form.findFirst({
    where: { id: formId, userId: session.user.id },
    select: {
      id: true,
      name: true,
      accessKey: true,
      honeypotField: true,
      builderConfig: true,
    },
  });

  if (!form) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Form Builder</h1>
        <p className="text-muted-foreground">{form.name}</p>
      </div>
      <FormBuilder
        formId={form.id}
        formName={form.name}
        accessKey={form.accessKey}
        honeypotField={form.honeypotField}
        initialConfig={form.builderConfig as { fields: unknown[] } | null}
      />
    </div>
  );
}
