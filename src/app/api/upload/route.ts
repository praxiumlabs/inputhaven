import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, validateFile } from "@/lib/r2";
import { PLANS } from "@/lib/plans";
import { Plan } from "@prisma/client";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  if (!user || !PLANS[user.plan as Plan].fileUploads) {
    return NextResponse.json(
      { error: "File uploads require a Starter plan or higher" },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const submissionId = formData.get("submissionId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const validation = validateFile(file.type, file.size);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  // Sanitize filename: strip path components and non-safe characters
  const safeName = file.name
    .replace(/.*[/\\]/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 200);
  const r2Key = `uploads/${session.user.id}/${crypto.randomBytes(16).toString("hex")}/${safeName}`;

  await uploadFile(r2Key, buffer, file.type);

  const fileUpload = await prisma.fileUpload.create({
    data: {
      submissionId: submissionId || "",
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      r2Key,
    },
  });

  return NextResponse.json({
    id: fileUpload.id,
    downloadToken: fileUpload.downloadToken,
  });
}
