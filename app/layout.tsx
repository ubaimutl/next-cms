import type { Metadata } from "next";

import "./globals.css";
import AppShell from "./components/layout/AppShell";
import { getPublicModuleSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

const themeInitScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("theme");
    const theme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch (error) {
    console.error("Failed to initialize theme", error);
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.shortName,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.shortName,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: [
      { url: "/img/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/img/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/img/favicon.ico", type: "image/x-icon" },
    ],
    apple: [{ url: "/img/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "mask-icon", url: "/img/safari-pinned-tab.svg" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const moduleSettings = await getPublicModuleSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-base-100 text-base-content">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <AppShell moduleSettings={moduleSettings}>{children}</AppShell>
      </body>
    </html>
  );
}
