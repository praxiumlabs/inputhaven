"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations";

export async function register(formData: {
  name: string;
  email: string;
  password: string;
}) {
  const validated = registerSchema.safeParse({
    ...formData,
    confirmPassword: formData.password,
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input" };
  }

  const { name, email, password } = validated.data;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Generic error to prevent enumeration
  if (existingUser) {
    return { error: "Unable to create account. Please try again." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Unable to create account. Please try again." };
    }
    console.error("[register] Unexpected error creating user:", err);
    return { error: "Unable to create account. Please try again." };
  }

  // Create verification token
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  // Send verification email
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "InputHaven <noreply@inputhaven.com>",
      to: normalizedEmail,
      subject: "Verify your email - InputHaven",
      html: `
        <h2>Welcome to InputHaven!</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
      `,
    });
  } catch {
    // Don't fail registration if email fails
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "user.registered",
      details: { method: "credentials" },
    },
  });

  return { success: true };
}

export async function forgotPassword(formData: { email: string }) {
  const validated = forgotPasswordSchema.safeParse(formData);
  if (!validated.success) return { error: "Invalid email" };

  const { email } = validated.data;
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Always return success to prevent enumeration
  if (!user) return { success: true };

  // Delete existing tokens
  await prisma.verificationToken.deleteMany({
    where: { identifier: `reset:${normalizedEmail}` },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${normalizedEmail}`,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "InputHaven <noreply@inputhaven.com>",
      to: normalizedEmail,
      subject: "Reset your password - InputHaven",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
      `,
    });
  } catch {
    // Silent fail
  }

  return { success: true };
}

export async function resetPassword(formData: {
  token: string;
  password: string;
}) {
  const validated = resetPasswordSchema.safeParse({
    ...formData,
    confirmPassword: formData.password,
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input" };
  }

  const { token, password } = validated.data;

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return { error: "Invalid or expired reset link" };
  }

  const email = verificationToken.identifier.replace("reset:", "");
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  // Invalidate all existing sessions for this user
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.session.deleteMany({ where: { userId: user.id } });
  }

  await prisma.verificationToken.delete({
    where: { token },
  });

  return { success: true };
}

export async function verifyEmail(token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return { error: "Invalid or expired verification link" };
  }

  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: { token },
  });

  return { success: true };
}
