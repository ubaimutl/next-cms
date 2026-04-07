import { access } from "node:fs/promises";
import path from "node:path";

const UPLOAD_SEGMENT_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function getUploadsBaseDirectory() {
  const configuredRoot = process.env.UPLOADS_ROOT?.trim();

  if (configuredRoot) {
    return path.isAbsolute(configuredRoot)
      ? configuredRoot
      : path.resolve(process.cwd(), configuredRoot);
  }

  return path.join(process.cwd(), "public", "uploads");
}

export function getUploadDirectory(kind: "posts" | "products" | "projects") {
  return path.join(getUploadsBaseDirectory(), kind);
}

function getCandidateUploadRoots() {
  const configuredRoot = process.env.UPLOADS_ROOT?.trim();
  const roots = [
    configuredRoot
      ? path.isAbsolute(configuredRoot)
        ? configuredRoot
        : path.resolve(process.cwd(), configuredRoot)
      : null,
    path.join(process.cwd(), "public", "uploads"),
  ].filter((value): value is string => Boolean(value));

  return [...new Set(roots)];
}

export function isSafeUploadPath(segments: string[]) {
  return (
    segments.length >= 2 &&
    segments.every(
      (segment) =>
        Boolean(segment) &&
        segment !== "." &&
        segment !== ".." &&
        UPLOAD_SEGMENT_PATTERN.test(segment),
    )
  );
}

export async function resolveUploadedFile(segments: string[]) {
  if (!isSafeUploadPath(segments)) {
    return null;
  }

  for (const root of getCandidateUploadRoots()) {
    const candidatePath = path.join(root, ...segments);

    try {
      await access(candidatePath);
      return candidatePath;
    } catch {
      continue;
    }
  }

  return null;
}
