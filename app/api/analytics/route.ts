import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { canManageSettings } from "@/lib/admin-permissions";
import { getAuthenticatedAdmin } from "@/lib/auth";
import {
  getAnalyticsSettings,
  recordAnalyticsPageView,
  setAnalyticsEnabled,
} from "@/lib/prisma";
import { consumePublicRateLimit } from "@/lib/public-rate-limit";
import { siteConfig } from "@/lib/site";

const TRACKING_COOKIE_NAME = "ubai_analytics_visitor";
const TRACKING_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const trackAnalyticsSchema = z.object({
  path: z.string().trim().min(1),
});

const updateAnalyticsSettingsSchema = z.object({
  enabled: z.boolean(),
});

function normalizeTrackedPath(rawPath: string) {
  const url = new URL(rawPath, siteConfig.url);
  const pathname = url.pathname.trim();

  if (!pathname.startsWith("/")) {
    return null;
  }

  const normalizedPath =
    pathname !== "/" ? pathname.replace(/\/+$/u, "") || "/" : pathname;

  if (
    normalizedPath.startsWith("/admin") ||
    normalizedPath.startsWith("/api") ||
    normalizedPath.startsWith("/_next")
  ) {
    return null;
  }

  return normalizedPath;
}

function getTrackedPostSlug(pathname: string) {
  const match = pathname.match(/^\/posts\/([^/]+)$/u);
  return match?.[1] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = trackAnalyticsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid analytics payload." }, { status: 400 });
    }

    const normalizedPath = normalizeTrackedPath(validation.data.path);

    if (!normalizedPath) {
      return NextResponse.json({ tracked: false }, { status: 200 });
    }

    const rateLimit = await consumePublicRateLimit("analytics", request);

    if (rateLimit) {
      return NextResponse.json(
        { error: "Too many analytics requests. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const existingVisitorToken = request.cookies.get(TRACKING_COOKIE_NAME)?.value;
    const visitorToken = existingVisitorToken || randomUUID().replace(/-/gu, "");
    const postSlug = getTrackedPostSlug(normalizedPath);
    const result = await recordAnalyticsPageView({
      path: normalizedPath,
      postSlug,
      visitorToken,
    });

    const response = NextResponse.json(
      { enabled: result.enabled, tracked: result.tracked },
      { status: 200 },
    );

    if (!existingVisitorToken) {
      response.cookies.set({
        name: TRACKING_COOKIE_NAME,
        value: visitorToken,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: TRACKING_COOKIE_MAX_AGE,
      });
    }

    return response;
  } catch (error) {
    console.error("Error tracking analytics:", error);
    return NextResponse.json({ error: "Failed to track analytics." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!canManageSettings(admin)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateAnalyticsSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid analytics settings payload." },
        { status: 400 },
      );
    }

    const settings = await setAnalyticsEnabled(validation.data.enabled);

    return NextResponse.json(
      {
        enabled: settings?.enabled ?? false,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating analytics settings:", error);
    return NextResponse.json(
      { error: "Failed to update analytics settings." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const settings = await getAnalyticsSettings();
    return NextResponse.json(
      {
        enabled: settings?.enabled ?? false,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error loading analytics settings:", error);
    return NextResponse.json(
      { error: "Failed to load analytics settings." },
      { status: 500 },
    );
  }
}
