"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: {
  name: string;
  company?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const validated = updateProfileSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: validated.data.name,
      company: validated.data.company || null,
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function changePassword(formData: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const validated = changePasswordSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.password) {
    return { error: "Cannot change password for OAuth accounts" };
  }

  const isValid = await bcrypt.compare(
    validated.data.currentPassword,
    user.password
  );

  if (!isValid) {
    return { error: "Current password is incorrect" };
  }

  const hashedPassword = await bcrypt.hash(validated.data.newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "user.password_changed",
    },
  });

  return { success: true };
}

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      plan: true,
      image: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });
}
