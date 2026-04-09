import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { del, put } from "@vercel/blob";

import { getUploadDirectory } from "./uploads";
import { resolveUploadedFile } from "./uploads";

export type UploadKind = "posts" | "products" | "projects";
export type StoredImage = {
  url: string;
  pathname: string;
  provider: "BLOB" | "LOCAL";
  mimeType: string;
  size: number;
};

const LOCAL_MAX_FILE_SIZE = 8 * 1024 * 1024;
const BLOB_MAX_FILE_SIZE = Math.floor(4.5 * 1024 * 1024);

const allowedMimeTypes: Record<string, string> = {
  "image/avif": ".avif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const fallbackNames: Record<UploadKind, string> = {
  posts: "post-image",
  products: "product-image",
  projects: "project-image",
};

export function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function isBlobStorageUrl(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function isManagedLocalUploadUrl(value: string | null | undefined) {
  return Boolean(value?.startsWith("/uploads/"));
}

export function getMaxUploadFileSize() {
  return hasBlobStorage() ? BLOB_MAX_FILE_SIZE : LOCAL_MAX_FILE_SIZE;
}

export function getMaxUploadFileSizeLabel() {
  return hasBlobStorage() ? "4.5MB" : "8MB";
}

export function validateUploadEntry(entry: FormDataEntryValue | null) {
  if (!entry || typeof entry === "string") {
    return { error: "Image file is required.", status: 400 } as const;
  }

  if (entry.size === 0) {
    return { error: "Image file is empty.", status: 400 } as const;
  }

  const maxFileSize = getMaxUploadFileSize();

  if (entry.size > maxFileSize) {
    return {
      error: `Image file must be ${getMaxUploadFileSizeLabel()} or smaller.`,
      status: 400,
    } as const;
  }

  const extension = allowedMimeTypes[entry.type];

  if (!extension) {
    return { error: "Unsupported image format.", status: 400 } as const;
  }

  return { file: entry, extension } as const;
}

function sanitizeFileName(value: string, kind: UploadKind) {
  const extension = path.extname(value);
  const baseName = path.basename(value, extension);
  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return sanitized || fallbackNames[kind];
}

async function uploadToBlob(file: File, kind: UploadKind, extension: string) {
  const pathname = `${kind}/${Date.now()}-${randomUUID()}-${sanitizeFileName(file.name, kind)}${extension}`;
  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });

  return {
    url: blob.url,
    pathname,
    provider: "BLOB" as const,
    mimeType: file.type,
    size: file.size,
  };
}

async function uploadToLocal(file: File, kind: UploadKind, extension: string) {
  const uploadDirectory = getUploadDirectory(kind);
  await mkdir(uploadDirectory, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}-${sanitizeFileName(file.name, kind)}${extension}`;
  const filePath = path.join(uploadDirectory, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  const pathname = `${kind}/${fileName}`;

  await writeFile(filePath, buffer);

  return {
    url: `/uploads/${kind}/${fileName}`,
    pathname,
    provider: "LOCAL" as const,
    mimeType: file.type,
    size: file.size,
  };
}

export async function storeUploadedImage(
  file: File,
  kind: UploadKind,
  extension: string,
) {
  if (hasBlobStorage()) {
    return uploadToBlob(file, kind, extension);
  }

  return uploadToLocal(file, kind, extension);
}

export async function deleteStoredImage(value: string | null | undefined) {
  if (!value) {
    return;
  }

  if (isBlobStorageUrl(value)) {
    await del(value);
    return;
  }

  if (!isManagedLocalUploadUrl(value)) {
    return;
  }

  const segments = value
    .replace(/^\/uploads\//, "")
    .split("/")
    .filter(Boolean);
  const filePath = await resolveUploadedFile(segments);

  if (!filePath) {
    return;
  }

  await unlink(filePath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") {
      throw error;
    }
  });
}
