import "server-only";

import type { MediaKind } from "@/app/generated/prisma/client";

import { readStringList } from "@/lib/db-json";
import {
  deleteStoredImage,
  isBlobStorageUrl,
  isManagedLocalUploadUrl,
  type StoredImage,
  type UploadKind,
} from "@/lib/media-storage";
import prisma from "@/lib/prisma";

export type AdminMediaAssetRecord = {
  id: number;
  url: string;
  pathname: string;
  provider: "BLOB" | "LOCAL";
  kind: "POST_IMAGE" | "PROJECT_IMAGE" | "PRODUCT_IMAGE";
  mimeType: string;
  size: number;
  usageCount: number;
  uploadedByName: string | null;
  uploadedByEmail: string | null;
  createdAt: string;
};

function buildUsageCounter() {
  const counts = new Map<string, number>();

  function increment(url: string | null | undefined) {
    if (!url) {
      return;
    }

    counts.set(url, (counts.get(url) ?? 0) + 1);
  }

  return {
    counts,
    increment,
  };
}

async function buildMediaUsageMap() {
  const [posts, projects, products] = await Promise.all([
    prisma.post.findMany({
      where: {
        featuredImage: {
          not: null,
        },
      },
      select: {
        featuredImage: true,
      },
    }),
    prisma.project.findMany({
      select: {
        images: true,
      },
    }),
    prisma.shopProduct.findMany({
      select: {
        images: true,
      },
    }),
  ]);
  const usage = buildUsageCounter();

  for (const post of posts) {
    usage.increment(post.featuredImage);
  }

  for (const project of projects) {
    for (const image of readStringList(project.images)) {
      usage.increment(image);
    }
  }

  for (const product of products) {
    for (const image of readStringList(product.images)) {
      usage.increment(image);
    }
  }

  return usage.counts;
}

export function mediaKindForUploadKind(kind: UploadKind): MediaKind {
  if (kind === "posts") {
    return "POST_IMAGE";
  }

  if (kind === "projects") {
    return "PROJECT_IMAGE";
  }

  return "PRODUCT_IMAGE";
}

export async function registerMediaAsset(options: {
  storedImage: StoredImage;
  kind: UploadKind;
  uploadedById: number | null;
}) {
  const { storedImage, kind, uploadedById } = options;

  return prisma.mediaAsset.upsert({
    where: {
      url: storedImage.url,
    },
    create: {
      url: storedImage.url,
      pathname: storedImage.pathname,
      provider: storedImage.provider,
      kind: mediaKindForUploadKind(kind),
      mimeType: storedImage.mimeType,
      size: storedImage.size,
      uploadedById,
    },
    update: {
      pathname: storedImage.pathname,
      provider: storedImage.provider,
      kind: mediaKindForUploadKind(kind),
      mimeType: storedImage.mimeType,
      size: storedImage.size,
      uploadedById,
    },
  });
}

export async function listAdminMediaAssets(): Promise<AdminMediaAssetRecord[]> {
  const [assets, usageMap] = await Promise.all([
    prisma.mediaAsset.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    buildMediaUsageMap(),
  ]);

  return assets.map((asset) => ({
    id: asset.id,
    url: asset.url,
    pathname: asset.pathname,
    provider: asset.provider,
    kind: asset.kind,
    mimeType: asset.mimeType,
    size: asset.size,
    usageCount: usageMap.get(asset.url) ?? 0,
    uploadedByName: asset.uploadedBy?.name ?? null,
    uploadedByEmail: asset.uploadedBy?.email ?? null,
    createdAt: asset.createdAt.toISOString(),
  }));
}

export async function getMediaUsageCount(url: string) {
  const usageMap = await buildMediaUsageMap();
  return usageMap.get(url) ?? 0;
}

export async function cleanupManagedMediaUrls(urls: string[]) {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];

  if (uniqueUrls.length === 0) {
    return;
  }

  const usageMap = await buildMediaUsageMap();

  for (const url of uniqueUrls) {
    const usageCount = usageMap.get(url) ?? 0;

    if (usageCount > 0) {
      continue;
    }

    const isManagedStorage =
      isBlobStorageUrl(url) || isManagedLocalUploadUrl(url);

    if (isManagedStorage) {
      await deleteStoredImage(url);
    }

    await prisma.mediaAsset.deleteMany({
      where: {
        url,
      },
    });
  }
}

export async function cleanupManagedMediaUrl(url: string | null | undefined) {
  if (!url) {
    return;
  }

  await cleanupManagedMediaUrls([url]);
}
