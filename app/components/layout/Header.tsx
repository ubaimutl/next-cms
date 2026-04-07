"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { PublicModuleSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

import Logo from "./Logo";

type ThemeMode = "light" | "dark";

type NavItem = {
  name: string;
  path: string;
};

function getNavLinks(moduleSettings: PublicModuleSettings): NavItem[] {
  return [
    { name: "Home", path: "/" },
    ...(moduleSettings.projectsEnabled ? [{ name: "Work", path: "/work" }] : []),
    ...(moduleSettings.blogEnabled ? [{ name: "Blog", path: "/posts" }] : []),
    ...(moduleSettings.shopEnabled ? [{ name: "Shop", path: "/shop" }] : []),
    { name: "Contact", path: "/contact" },
  ];
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem("theme");

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return "dark";
}

function applyTheme(theme: ThemeMode) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("theme", theme);
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.body.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new Event("themechange"));
}

export default function Header({
  moduleSettings,
}: {
  moduleSettings: PublicModuleSettings;
}) {
  const pathname = usePathname();
  const navLinks = getNavLinks(moduleSettings);
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <header id="site-header" className="fixed inset-x-0 top-0 z-50">
      <div className="shell">
        <div className="flex min-h-[var(--header-height)] items-center justify-between gap-4">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="front-icon-button shrink-0"
            aria-label={siteConfig.shortName}
          >
            <Logo className="h-4.5 w-4.5" />
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="front-nav-pill">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;

                return (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      data-active={isActive}
                      className="front-nav-link"
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-4 text-[0.9rem]">
            <button
              type="button"
              onClick={() =>
                setTheme((current) => (current === "light" ? "dark" : "light"))
              }
              className="hidden text-base-content/64 transition hover:text-base-content sm:inline-flex"
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>

            <Link
              href="/admin"
              className="hidden text-base-content/64 transition hover:text-base-content/88 sm:inline-flex"
            >
              Admin
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="front-icon-button md:hidden"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-site-nav"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              >
                {isMenuOpen ? (
                  <>
                    <path d="M6 6L18 18" />
                    <path d="M18 6L6 18" />
                  </>
                ) : (
                  <>
                    <path d="M7 8H17" />
                    <path d="M7 12H17" />
                    <path d="M7 16H17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <div
            id="mobile-site-nav"
            className="front-card mt-1 p-4 md:hidden"
          >
            <nav aria-label="Mobile primary">
              <ul className="space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.path;

                  return (
                    <li key={link.path}>
                      <Link
                        href={link.path}
                        onClick={() => setMenuOpen(false)}
                        className={`block rounded-full px-3 py-2 text-[1rem] ${
                          isActive
                            ? "bg-[var(--surface-soft)] text-base-content"
                            : "text-base-content/66"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-5 flex items-center justify-between border-t border-[var(--line-soft)] pt-4 text-sm">
              <button
                type="button"
                onClick={() =>
                  setTheme((current) => (current === "light" ? "dark" : "light"))
                }
                className="text-base-content/66"
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-base-content/66"
              >
                Admin
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
