import "server-only";

import { createHash } from "node:crypto";

import type { NextRequest } from "next/server";

import prisma from "@/lib/prisma";

const REQUEST_RATE_LIMIT_WINDOW_MS = 1000 * 60 * 15;
const REQUEST_RATE_LIMIT_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type PublicRateLimitScope = "analytics" | "contact";

type PublicRateLimitConfig = {
  blockMs: number;
  maxRequests: number;
};

type PublicRateLimitResult = {
  blockedUntil: Date;
  retryAfterSeconds: number;
};

const PUBLIC_RATE_LIMITS: Record<PublicRateLimitScope, PublicRateLimitConfig> = {
  analytics: {
    blockMs: 1000 * 60 * 15,
    maxRequests: 90,
  },
  contact: {
    blockMs: 1000 * 60 * 30,
    maxRequests: 5,
  },
};

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function getRequestIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const forwardedIp = forwardedFor.split(",")[0]?.trim();

    if (forwardedIp) {
      return forwardedIp;
    }
  }

  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function getRateLimitKey(scope: PublicRateLimitScope, request: NextRequest) {
  return `public:${scope}:ip:${hashValue(getRequestIp(request))}`;
}

function getWindowStart() {
  return new Date(Date.now() - REQUEST_RATE_LIMIT_WINDOW_MS);
}

async function cleanupPublicRateLimits() {
  await prisma.authRateLimit.deleteMany({
    where: {
      key: {
        startsWith: "public:",
      },
      updatedAt: {
        lt: new Date(Date.now() - REQUEST_RATE_LIMIT_TTL_MS),
      },
      OR: [{ blockedUntil: null }, { blockedUntil: { lt: new Date() } }],
    },
  });
}

export async function consumePublicRateLimit(
  scope: PublicRateLimitScope,
  request: NextRequest,
) {
  await cleanupPublicRateLimits();

  const { blockMs, maxRequests } = PUBLIC_RATE_LIMITS[scope];
  const key = getRateLimitKey(scope, request);
  const existing = await prisma.authRateLimit.findUnique({
    where: {
      key,
    },
  });

  if (existing?.blockedUntil && existing.blockedUntil > new Date()) {
    return {
      blockedUntil: existing.blockedUntil,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.blockedUntil.getTime() - Date.now()) / 1000),
      ),
    } satisfies PublicRateLimitResult;
  }

  const currentTime = new Date();
  const shouldResetWindow =
    !existing || existing.lastFailedAt < getWindowStart();
  const requestCount = shouldResetWindow ? 1 : existing.failures + 1;
  const blockedUntil =
    requestCount > maxRequests
      ? new Date(Date.now() + blockMs)
      : null;

  await prisma.authRateLimit.upsert({
    where: {
      key,
    },
    create: {
      key,
      failures: requestCount,
      firstFailedAt: currentTime,
      lastFailedAt: currentTime,
      blockedUntil,
    },
    update: {
      failures: requestCount,
      firstFailedAt: shouldResetWindow ? currentTime : existing.firstFailedAt,
      lastFailedAt: currentTime,
      blockedUntil,
    },
  });

  if (!blockedUntil) {
    return null;
  }

  return {
    blockedUntil,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((blockedUntil.getTime() - Date.now()) / 1000),
    ),
  } satisfies PublicRateLimitResult;
}
