"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey, hashApiKey } from "@/lib/security";
import { createApiKeySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createApiKey(formData: { name: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const validated = createApiKeySchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input" };
  }

  const { key, hash, prefix } = generateApiKey();

  await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      name: validated.data.name,
      keyHash: hash,
      keyPrefix: prefix,
    },
  });

  revalidatePath("/dashboard/api-keys");
  // Return the key only once - it won't be stored in plaintext
  return { success: true, key };
}

export async function getApiKeys() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsed: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteApiKey(keyId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, userId: session.user.id },
  });

  if (!key) return { error: "API key not found" };

  await prisma.apiKey.delete({ where: { id: keyId } });

  revalidatePath("/dashboard/api-keys");
  return { success: true };
}
