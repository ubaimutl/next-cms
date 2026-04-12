import "server-only";

import { createHash, randomBytes } from "node:crypto";

import prisma from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

const PASSWORD_CHANGE_TOKEN_TTL_MS = 1000 * 60 * 30;

function hashPasswordChangeToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getAppOrigin() {
  const configuredOrigin =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    siteConfig.url;

  try {
    return new URL(configuredOrigin).origin;
  } catch {
    return siteConfig.url;
  }
}

export function buildPasswordChangeConfirmUrl(token: string) {
  const url = new URL("/admin/password-change", getAppOrigin());
  url.searchParams.set("token", token);
  return url.toString();
}

export async function createPasswordChangeToken(
  userId: number,
  pendingPasswordHash: string,
) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordChangeToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_CHANGE_TOKEN_TTL_MS);

  await prisma.passwordChangeToken.deleteMany({
    where: {
      userId,
    },
  });

  await prisma.passwordChangeToken.create({
    data: {
      tokenHash,
      pendingPasswordHash,
      expiresAt,
      userId,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export async function clearPasswordChangeTokensForUser(userId: number) {
  await prisma.passwordChangeToken.deleteMany({
    where: {
      userId,
    },
  });
}

export async function consumePasswordChangeToken(rawToken: string) {
  const tokenHash = hashPasswordChangeToken(rawToken);
  const currentTime = new Date();

  const passwordChangeToken = await prisma.passwordChangeToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          active: true,
        },
      },
    },
  });

  if (!passwordChangeToken) {
    return { ok: false as const, reason: "invalid" as const };
  }

  if (passwordChangeToken.usedAt) {
    return { ok: false as const, reason: "used" as const };
  }

  if (passwordChangeToken.expiresAt <= currentTime) {
    return { ok: false as const, reason: "expired" as const };
  }

  if (!passwordChangeToken.user.active) {
    return { ok: false as const, reason: "inactive" as const };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: passwordChangeToken.userId,
      },
      data: {
        passwordHash: passwordChangeToken.pendingPasswordHash,
      },
    }),
    prisma.passwordChangeToken.update({
      where: {
        id: passwordChangeToken.id,
      },
      data: {
        usedAt: currentTime,
      },
    }),
    prisma.session.deleteMany({
      where: {
        userId: passwordChangeToken.userId,
      },
    }),
    prisma.passwordChangeToken.deleteMany({
      where: {
        userId: passwordChangeToken.userId,
        id: {
          not: passwordChangeToken.id,
        },
      },
    }),
  ]);

  return {
    ok: true as const,
    user: passwordChangeToken.user,
  };
}
