import "server-only";

import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import {
  ADMIN_ACCESS_ROLES,
  canAccessAdmin,
  canManageSettings,
} from "@/lib/admin-permissions";
import prisma from "@/lib/prisma";

const scrypt = promisify(scryptCallback);

const SESSION_COOKIE_NAME = "ubai_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;
const SESSION_TOUCH_INTERVAL_MS = 1000 * 60 * 30;
const SCRYPT_KEY_LENGTH = 64;
const AUTH_RATE_LIMIT_WINDOW_MS = 1000 * 60 * 15;
const AUTH_RATE_LIMIT_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const AUTH_EMAIL_MAX_FAILURES = 5;
const AUTH_IP_MAX_FAILURES = 10;
const AUTH_EMAIL_BLOCK_MS = 1000 * 60 * 30;
const AUTH_IP_BLOCK_MS = 1000 * 60 * 20;
const AUTH_FAILURE_DELAY_MS = 450;
type AuthRateLimitScope = "login" | "setup";

type AuthRateLimitKeyConfig = {
  blockMs: number;
  key: string;
  maxFailures: number;
};

type AuthRateLimitResult = {
  blockedUntil: Date;
  retryAfterSeconds: number;
};

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hashSessionToken(token: string) {
  return hashValue(token);
}

function hashUserAgent(userAgent: string | null) {
  if (!userAgent) return null;
  return hashValue(userAgent);
}

function getRequestIp(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");

  if (forwardedFor) {
    const forwardedIp = forwardedFor.split(",")[0]?.trim();
    if (forwardedIp) return forwardedIp;
  }

  return (
    requestHeaders.get("cf-connecting-ip") ??
    requestHeaders.get("x-real-ip") ??
    "unknown"
  );
}

function nowPlus(milliseconds: number) {
  return new Date(Date.now() + milliseconds);
}

function getWindowStart() {
  return new Date(Date.now() - AUTH_RATE_LIMIT_WINDOW_MS);
}

function getRateLimitKey(scope: AuthRateLimitScope, type: "ip" | "email", value: string) {
  return `${scope}:${type}:${hashValue(value)}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function cleanupAuthRateLimits() {
  await prisma.authRateLimit.deleteMany({
    where: {
      updatedAt: {
        lt: new Date(Date.now() - AUTH_RATE_LIMIT_TTL_MS),
      },
      OR: [{ blockedUntil: null }, { blockedUntil: { lt: new Date() } }],
    },
  });
}

async function getAuthRateLimitKeys(
  scope: AuthRateLimitScope,
  email?: string | null,
) {
  const requestHeaders = await headers();
  const ip = getRequestIp(requestHeaders);
  const keys: AuthRateLimitKeyConfig[] = [
    {
      blockMs: AUTH_IP_BLOCK_MS,
      key: getRateLimitKey(scope, "ip", ip),
      maxFailures: AUTH_IP_MAX_FAILURES,
    },
  ];

  if (email) {
    keys.push({
      blockMs: AUTH_EMAIL_BLOCK_MS,
      key: getRateLimitKey(scope, "email", normalizeEmail(email)),
      maxFailures: AUTH_EMAIL_MAX_FAILURES,
    });
  }

  return keys;
}

async function upsertAuthRateLimit(config: AuthRateLimitKeyConfig) {
  const existing = await prisma.authRateLimit.findUnique({
    where: {
      key: config.key,
    },
  });

  const currentTime = new Date();
  const shouldResetWindow =
    !existing || existing.lastFailedAt < getWindowStart();
  const failures = shouldResetWindow ? 1 : existing.failures + 1;
  const blockedUntil =
    failures >= config.maxFailures ? nowPlus(config.blockMs) : null;

  await prisma.authRateLimit.upsert({
    where: {
      key: config.key,
    },
    create: {
      key: config.key,
      failures,
      firstFailedAt: currentTime,
      lastFailedAt: currentTime,
      blockedUntil,
    },
    update: {
      failures,
      firstFailedAt: shouldResetWindow ? currentTime : existing.firstFailedAt,
      lastFailedAt: currentTime,
      blockedUntil,
    },
  });
}

export async function ensureAuthRateLimitAvailable(
  scope: AuthRateLimitScope,
  email?: string | null,
) {
  await cleanupAuthRateLimits();

  const keys = await getAuthRateLimitKeys(scope, email);
  const blockedRecords = await prisma.authRateLimit.findMany({
    where: {
      key: {
        in: keys.map((config) => config.key),
      },
      blockedUntil: {
        gt: new Date(),
      },
    },
    orderBy: {
      blockedUntil: "desc",
    },
  });

  const blockedUntil = blockedRecords[0]?.blockedUntil;

  if (!blockedUntil) {
    return null;
  }

  return {
    blockedUntil,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((blockedUntil.getTime() - Date.now()) / 1000),
    ),
  } satisfies AuthRateLimitResult;
}

export async function recordAuthFailure(
  scope: AuthRateLimitScope,
  email?: string | null,
) {
  const keys = await getAuthRateLimitKeys(scope, email);

  for (const config of keys) {
    await upsertAuthRateLimit(config);
  }
}

export async function clearAuthFailures(
  scope: AuthRateLimitScope,
  email?: string | null,
) {
  const keys = await getAuthRateLimitKeys(scope, email);

  await prisma.authRateLimit.deleteMany({
    where: {
      key: {
        in: keys.map((config) => config.key),
      },
    },
  });
}

export async function delayFailedAuthResponse() {
  await new Promise((resolve) =>
    setTimeout(resolve, AUTH_FAILURE_DELAY_MS),
  );
}

function getForwardedHeaderValues(value: string | null) {
  if (!value) return [];

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getTrustedAuthOrigins(request: NextRequest) {
  const trustedOrigins = new Set<string>();
  const hostCandidates = [
    ...getForwardedHeaderValues(request.headers.get("x-forwarded-host")),
    request.headers.get("host"),
    request.nextUrl.host,
  ].filter((value): value is string => Boolean(value));
  const protoCandidates = [
    ...getForwardedHeaderValues(request.headers.get("x-forwarded-proto")),
    request.nextUrl.protocol.replace(/:$/u, ""),
  ].filter((value): value is string => Boolean(value));

  for (const host of hostCandidates) {
    for (const proto of protoCandidates) {
      trustedOrigins.add(`${proto}://${host}`);
    }
  }

  const configuredOrigin =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL;

  if (configuredOrigin) {
    try {
      trustedOrigins.add(new URL(configuredOrigin).origin);
    } catch {
      // Ignore invalid deployment env values and rely on request headers.
    }
  }

  return trustedOrigins;
}

export function isTrustedAuthRequest(request: NextRequest) {
  const originHeader = request.headers.get("origin");

  if (!originHeader) {
    return true;
  }

  try {
    const origin = new URL(originHeader);
    return getTrustedAuthOrigins(request).has(origin.origin);
  } catch {
    return false;
  }
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(
    password,
    salt,
    SCRYPT_KEY_LENGTH,
  )) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedKey] = passwordHash.split(":");

  if (!salt || !storedKey) {
    return false;
  }

  const derivedKey = (await scrypt(
    password,
    salt,
    SCRYPT_KEY_LENGTH,
  )) as Buffer;
  const storedKeyBuffer = Buffer.from(storedKey, "hex");

  if (storedKeyBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKeyBuffer, derivedKey);
}

export async function getConfiguredAdmin() {
  return prisma.user.findFirst({
    where: {
      role: {
        in: ADMIN_ACCESS_ROLES,
      },
    },
    orderBy: [{ role: "asc" }, { id: "asc" }],
  });
}

export async function hasConfiguredAdminPassword() {
  const admin = await prisma.user.findFirst({
    where: {
      role: {
        in: ADMIN_ACCESS_ROLES,
      },
      active: true,
      passwordHash: {
        not: null,
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(admin);
}

export async function createAdminSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const requestHeaders = await headers();
  const userAgentHash = hashUserAgent(requestHeaders.get("user-agent"));

  await prisma.session.deleteMany({
    where: {
      userId,
    },
  });

  await prisma.session.create({
    data: {
      tokenHash,
      userAgentHash,
      expiresAt,
      userId,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
    priority: "high",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(sessionToken),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashSessionToken(sessionToken),
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  const requestHeaders = await headers();
  const currentUserAgentHash = hashUserAgent(requestHeaders.get("user-agent"));
  const isExpired = session.expiresAt <= new Date();
  const hasUserAgentMismatch =
    session.userAgentHash !== null &&
    currentUserAgentHash !== null &&
    session.userAgentHash !== currentUserAgentHash;

  if (isExpired || !canAccessAdmin(session.user) || hasUserAgentMismatch) {
    await prisma.session.deleteMany({
      where: {
        id: session.id,
      },
    });
    return null;
  }

  const currentTime = Date.now();
  const shouldTouchSession =
    currentTime - session.lastSeenAt.getTime() >= SESSION_TOUCH_INTERVAL_MS;

  if (shouldTouchSession) {
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        lastSeenAt: new Date(currentTime),
      },
    });
  }

  return session.user;
}

export async function requireAuthenticatedAdmin() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function requireSettingsManager() {
  const admin = await requireAuthenticatedAdmin();

  if (!canManageSettings(admin)) {
    redirect("/admin");
  }

  return admin;
}

export { normalizeEmail };
