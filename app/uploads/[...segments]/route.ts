import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { resolveUploadedFile } from "@/lib/uploads";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

async function getUploadResponse(
  _request: NextRequest,
  { params }: { params: Promise<{ segments: string[] }> },
  includeBody: boolean,
) {
  const { segments } = await params;
  const filePath = await resolveUploadedFile(segments);

  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const [fileStats, fileBuffer] = await Promise.all([
    stat(filePath),
    includeBody ? readFile(filePath) : Promise.resolve(null),
  ]);

  const contentType =
    CONTENT_TYPES[path.extname(filePath).toLowerCase()] ??
    "application/octet-stream";

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(fileStats.size),
      "Content-Type": contentType,
    },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ segments: string[] }> },
) {
  return getUploadResponse(request, context, true);
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ segments: string[] }> },
) {
  return getUploadResponse(request, context, false);
}

