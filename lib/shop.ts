import { cache } from "react";

import prisma from "@/lib/prisma";
import { getPublicModuleSettings } from "@/lib/settings";
import { SHOP_CURRENCY, formatPrice, getProductKindLabel } from "@/lib/shop-helpers";

export const getShopProducts = cache(async () => {
  const settings = await getPublicModuleSettings();

  if (!settings.shopEnabled) {
    return [];
  }

  return prisma.shopProduct.findMany({
    where: {
      active: true,
    },
    orderBy: {
      id: "desc",
    },
  });
});

export const getShopProductBySlug = cache(async (slug: string) => {
  const settings = await getPublicModuleSettings();

  if (!settings.shopEnabled) {
    return null;
  }

  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    return null;
  }

  const product = await prisma.shopProduct.findUnique({
    where: {
      slug: normalizedSlug,
    },
  });

  return product?.active ? product : null;
});

export { SHOP_CURRENCY, formatPrice, getProductKindLabel };
