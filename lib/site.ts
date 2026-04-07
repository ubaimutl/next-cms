const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "next-cms";
const siteShortName =
  process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "next-cms";

export const siteConfig = {
  name: siteName,
  shortName: siteShortName,
  title: siteName,
  description:
    "A modular Next.js CMS starter for studios, portfolios, content sites, and small commerce flows.",
  url: siteUrl,
  email: process.env.NEXT_PUBLIC_SITE_EMAIL || "hello@example.com",
  location: process.env.NEXT_PUBLIC_SITE_LOCATION || "Berlin, Germany",
  ogImage:
    process.env.NEXT_PUBLIC_SITE_OG_IMAGE || `${siteUrl}/img/logo.png`,
  keywords: [
    "Next.js CMS",
    "Prisma starter",
    "PostgreSQL CMS",
    "Portfolio starter",
    "Shop starter",
    "Content management",
    "Admin dashboard",
    "Studio website starter",
  ],
};
