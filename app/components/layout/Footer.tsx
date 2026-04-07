import Link from "next/link";

import { getPublicModuleSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

export default async function Footer() {
  const moduleSettings = await getPublicModuleSettings();
  const footerLinks = [
    { label: "Home", href: "/" },
    ...(moduleSettings.projectsEnabled ? [{ label: "Work", href: "/work" }] : []),
    ...(moduleSettings.blogEnabled ? [{ label: "Blog", href: "/posts" }] : []),
    ...(moduleSettings.shopEnabled ? [{ label: "Shop", href: "/shop" }] : []),
    { label: "Contact", href: "/contact" },
  ];

  return (
    <footer className="shell mt-24 pb-12">
      <div className="front-rule pt-8">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="max-w-2xl">
            <p className="front-kicker">Contact</p>
            <p className="mt-3 text-[1.35rem] leading-tight tracking-[-0.03em] text-base-content">
              {siteConfig.shortName} is based in {siteConfig.location}.
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="front-link mt-3"
            >
              {siteConfig.email}
            </a>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.92rem] text-base-content/62">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-base-content/88"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
