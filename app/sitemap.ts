import type { MetadataRoute } from "next";

import { getPosts } from "@/lib/posts";
import { getPublicModuleSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";
import { getShopProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getPublicModuleSettings();
  const routes = [
    "",
    ...(settings.projectsEnabled ? ["/work"] : []),
    ...(settings.shopEnabled ? ["/shop"] : []),
    "/contact",
    ...(settings.blogEnabled ? ["/posts"] : []),
  ];
  const [posts, products] = await Promise.all([
    settings.blogEnabled ? getPosts() : Promise.resolve([]),
    settings.shopEnabled ? getShopProducts() : Promise.resolve([]),
  ]);
  const staticRoutes = routes.map((route) => {
    const changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] =
      route === "" ? "weekly" : "monthly";

    return {
      url: `${siteConfig.url}${route}`,
      lastModified: new Date(),
      changeFrequency,
      priority: route === "" ? 1 : 0.8,
    };
  });

  const postRoutes = posts.map((post: { slug: string }) => ({
    url: `${siteConfig.url}/posts/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const productRoutes = products.map((product: { slug: string }) => ({
    url: `${siteConfig.url}/shop/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...postRoutes, ...productRoutes];
}
