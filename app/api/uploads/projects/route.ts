import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/auth";
import { getUploadDirectory } from "@/lib/uploads";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const allowedMimeTypes: Record<string, string> = {
  "image/avif": ".avif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function sanitizeFileName(value: string) {
  const extension = path.extname(value);
  const baseName = path.basename(value, extension);
  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return sanitized || "project-image";
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const entry = formData.get("file");

    if (!entry || typeof entry === "string") {
      return NextResponse.json(
        { error: "Image file is required." },
        { status: 400 },
      );
    }

    if (entry.size === 0) {
      return NextResponse.json(
        { error: "Image file is empty." },
        { status: 400 },
      );
    }

    if (entry.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image file must be 8MB or smaller." },
        { status: 400 },
      );
    }

    const extension = allowedMimeTypes[entry.type];

    if (!extension) {
      return NextResponse.json(
        { error: "Unsupported image format." },
        { status: 400 },
      );
    }

    const uploadDirectory = getUploadDirectory("projects");
    await mkdir(uploadDirectory, { recursive: true });

    const fileName = `${Date.now()}-${randomUUID()}-${sanitizeFileName(entry.name)}${extension}`;
    const filePath = path.join(uploadDirectory, fileName);
    const buffer = Buffer.from(await entry.arrayBuffer());

    await writeFile(filePath, buffer);

    return NextResponse.json(
      { url: `/uploads/projects/${fileName}` },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error uploading project image:", error);
    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 },
    );
  }
}
