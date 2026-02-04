"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createFormSchema, updateFormSchema, builderConfigSchema } from "@/lib/validations";
import { canCreateForm, getPlanConfig } from "@/lib/plans";
import { generateWebhookSecret } from "@/lib/security";
import { generateAccessKey } from "@/lib/utils";
import { Plan, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createForm(formData: {
  name: string;
  emailTo: string;
  allowedDomains?: string;
  honeypotField?: string;
  customSubject?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const validated = createFormSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { forms: true } } },
  });

  if (!user) return { error: "User not found" };

  if (!canCreateForm(user.plan, user._count.forms)) {
    return { error: "Form limit reached. Please upgrade your plan." };
  }

  const domains = validated.data.allowedDomains
    ? validated.data.allowedDomains.split(",").map((d) => d.trim()).filter(Boolean)
    : [];

  const form = await prisma.form.create({
    data: {
      userId: session.user.id,
      name: validated.data.name,
      emailTo: validated.data.emailTo,
      accessKey: generateAccessKey(),
      allowedDomains: domains,
      honeypotField: validated.data.honeypotField || null,
      customSubject: validated.data.customSubject || null,
    },
  });

  revalidatePath("/dashboard/forms");
  return { success: true, formId: form.id };
}

export async function updateForm(
  formId: string,
  formData: {
    name: string;
    emailTo: string;
    allowedDomains?: string;
    honeypotField?: string;
    customSubject?: string;
    webhookUrl?: string;
    autoResponse?: boolean;
    autoResponseMsg?: string;
    isActive?: boolean;
    aiSpamFilter?: boolean;
    emailRoutes?: { id: string; field: string; operator: string; value: string; emailTo: string }[];
  }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const validated = updateFormSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  if (!user) return { error: "User not found" };

  const form = await prisma.form.findFirst({
    where: { id: formId, userId: session.user.id },
  });

  if (!form) return { error: "Form not found" };

  const planConfig = getPlanConfig(user.plan);

  // Plan gating for AI spam filter
  const aiSpamFilter = validated.data.aiSpamFilter && planConfig.aiSpamFilter
    ? true
    : false;

  // Plan gating for email routing
  const emailRoutes = validated.data.emailRoutes && planConfig.emailRouting
    ? validated.data.emailRoutes
    : [];

  const domains = validated.data.allowedDomains
    ? validated.data.allowedDomains.split(",").map((d) => d.trim()).filter(Boolean)
    : [];

  // Generate webhook secret if webhook URL is being set for the first time
  let webhookSecret = form.webhookSecret;
  if (validated.data.webhookUrl && !form.webhookSecret) {
    webhookSecret = generateWebhookSecret();
  }
  if (!validated.data.webhookUrl) {
    webhookSecret = null;
  }

  await prisma.form.update({
    where: { id: formId },
    data: {
      name: validated.data.name,
      emailTo: validated.data.emailTo,
      allowedDomains: domains,
      honeypotField: validated.data.honeypotField || null,
      customSubject: validated.data.customSubject || null,
      webhookUrl: validated.data.webhookUrl || null,
      webhookSecret,
      autoResponse: validated.data.autoResponse ?? false,
      autoResponseMsg: validated.data.autoResponseMsg || null,
      isActive: validated.data.isActive ?? true,
      aiSpamFilter,
      emailRoutes: emailRoutes satisfies Prisma.InputJsonValue,
    },
  });

  revalidatePath(`/dashboard/forms/${formId}`);
  return { success: true };
}

export async function updateBuilderConfig(
  formId: string,
  config: { fields: unknown[] }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const validated = builderConfigSchema.safeParse(config);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid builder config" };
  }

  const form = await prisma.form.findFirst({
    where: { id: formId, userId: session.user.id },
  });

  if (!form) return { error: "Form not found" };

  await prisma.form.update({
    where: { id: formId },
    data: {
      builderConfig: validated.data satisfies Prisma.InputJsonValue,
    },
  });

  revalidatePath(`/dashboard/forms/${formId}`);
  return { success: true };
}

export async function deleteForm(formId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const form = await prisma.form.findFirst({
    where: { id: formId, userId: session.user.id },
  });

  if (!form) return { error: "Form not found" };

  await prisma.form.delete({ where: { id: formId } });

  revalidatePath("/dashboard/forms");
  return { success: true };
}

export async function getForms() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.form.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getForm(formId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.form.findFirst({
    where: { id: formId, userId: session.user.id },
    include: {
      _count: { select: { submissions: true } },
    },
  });
}
