"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next")
    ) {
      return;
    }

    if (lastTrackedPathRef.current === pathname) {
      return;
    }

    lastTrackedPathRef.current = pathname;
    const payload = JSON.stringify({ path: pathname });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const sent = navigator.sendBeacon(
        "/api/analytics",
        new Blob([payload], { type: "application/json" }),
      );

      if (sent) {
        return;
      }
    }

    void fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
      credentials: "same-origin",
    });
  }, [pathname]);

  return null;
}
