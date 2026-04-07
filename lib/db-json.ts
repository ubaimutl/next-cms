import { Prisma } from "@/app/generated/prisma/client";
import { normalizeExternalUrl } from "@/lib/url";

export function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

export function writeStringList(values: string[]): Prisma.InputJsonArray {
  return values as Prisma.InputJsonArray;
}

export function normalizeProjectRecord<
  T extends { tags: unknown; images: unknown; link?: string | null },
>(
  project: T,
) {
  return {
    ...project,
    tags: readStringList(project.tags),
    images: readStringList(project.images),
    link: normalizeExternalUrl(project.link),
  };
}

export function normalizeShopProductRecord<
  T extends {
    highlights: unknown;
    images: unknown;
    availability?: string;
    requiresBrief?: boolean;
    briefPrompt?: string | null;
  },
>(product: T) {
  return {
    ...product,
    availability: product.availability ?? "AVAILABLE",
    requiresBrief: Boolean(product.requiresBrief),
    briefPrompt: product.briefPrompt ?? null,
    highlights: readStringList(product.highlights),
    images: readStringList(product.images),
  };
}

export function normalizeContactMessageRecord<T extends { services: unknown }>(
  message: T,
) {
  return {
    ...message,
    services: readStringList(message.services),
  };
}
