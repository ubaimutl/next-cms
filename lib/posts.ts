import { cache } from "react";

import prisma from "@/lib/prisma";
import { getPublicModuleSettings } from "@/lib/settings";

export const getPosts = cache(async () => {
  const settings = await getPublicModuleSettings();

  if (!settings.blogEnabled) {
    return [];
  }

  return prisma.post.findMany({
    where: {
      published: true,
    },
    orderBy: {
      id: "desc",
    },
  });
});

export const getPostBySlug = cache(async (slug: string) => {
  const settings = await getPublicModuleSettings();

  if (!settings.blogEnabled) {
    return null;
  }

  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    return null;
  }

  const post = await prisma.post.findUnique({
    where: {
      slug: normalizedSlug,
    },
  });

  return post?.published ? post : null;
});
