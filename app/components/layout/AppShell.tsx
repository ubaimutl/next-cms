"use client";

import { usePathname } from "next/navigation";

import type { PublicModuleSettings } from "@/lib/settings";

import AnalyticsTracker from "./AnalyticsTracker";
import Header from "./Header";

export default function AppShell({
  children,
  moduleSettings,
}: {
  children: React.ReactNode;
  moduleSettings: PublicModuleSettings;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <main className="relative z-20 m-0 flex min-h-svh w-full max-w-full list-none flex-col overflow-x-clip pt-0 leading-none">
        {children}
      </main>
    );
  }

  return (
    <>
      <AnalyticsTracker />
      <div className="public-shell">
        <Header moduleSettings={moduleSettings} />
        <main className="public-main">{children}</main>
      </div>
    </>
  );
}
