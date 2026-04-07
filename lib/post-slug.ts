export function slugifyPostTitle(title: string) {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "post";
}

function createUniqueSlugFromUsed(baseSlug: string, usedSlugs: Set<string>) {
  if (!usedSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  let nextSlug = `${baseSlug}-${suffix}`;

  while (usedSlugs.has(nextSlug)) {
    suffix += 1;
    nextSlug = `${baseSlug}-${suffix}`;
  }

  return nextSlug;
}

export async function createUniquePostSlug(
  title: string,
  options: {
    excludeId?: number;
    prisma: {
      post: {
        findMany: (args: {
          where: {
            OR: Array<
              | { slug: string }
              | { slug: { startsWith: string } }
            >;
            NOT?: { id: number };
          };
          select: { slug: true };
        }) => Promise<Array<{ slug: string }>>;
      };
    };
  },
) {
  const baseSlug = slugifyPostTitle(title);
  const existingPosts = await options.prisma.post.findMany({
    where: {
      OR: [{ slug: baseSlug }, { slug: { startsWith: `${baseSlug}-` } }],
      ...(typeof options.excludeId === "number"
        ? { NOT: { id: options.excludeId } }
        : {}),
    },
    select: {
      slug: true,
    },
  });

  return createUniqueSlugFromUsed(
    baseSlug,
    new Set(existingPosts.map((post) => post.slug)),
  );
}

export async function createUniqueShopProductSlug(
  title: string,
  options: {
    excludeId?: number;
    prisma: {
      shopProduct: {
        findMany: (args: {
          where: {
            OR: Array<
              | { slug: string }
              | { slug: { startsWith: string } }
            >;
            NOT?: { id: number };
          };
          select: { slug: true };
        }) => Promise<Array<{ slug: string }>>;
      };
    };
  },
) {
  const baseSlug = slugifyPostTitle(title);
  const existingProducts = await options.prisma.shopProduct.findMany({
    where: {
      OR: [{ slug: baseSlug }, { slug: { startsWith: `${baseSlug}-` } }],
      ...(typeof options.excludeId === "number"
        ? { NOT: { id: options.excludeId } }
        : {}),
    },
    select: {
      slug: true,
    },
  });

  return createUniqueSlugFromUsed(
    baseSlug,
    new Set(existingProducts.map((product) => product.slug)),
  );
}
