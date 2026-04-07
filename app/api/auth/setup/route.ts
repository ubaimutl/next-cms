import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  clearAuthFailures,
  createAdminSession,
  delayFailedAuthResponse,
  ensureAuthRateLimitAvailable,
  getConfiguredAdmin,
  hashPassword,
  hasConfiguredAdminPassword,
  isTrustedAuthRequest,
  normalizeEmail,
  recordAuthFailure,
} from "@/lib/auth";
import prisma from "@/lib/prisma";

const setupSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.email(),
  password: z.string().min(12).max(200),
});

export async function POST(request: NextRequest) {
  try {
    if (!isTrustedAuthRequest(request)) {
      return NextResponse.json(
        { error: "Untrusted authentication request." },
        { status: 403 },
      );
    }

    const body = (await request.json().catch(() => null)) as
      | { name?: unknown; email?: unknown; password?: unknown }
      | null;
    const submittedEmail =
      typeof body?.email === "string" ? normalizeEmail(body.email) : null;
    const rateLimit = await ensureAuthRateLimitAvailable("setup", submittedEmail);

    if (rateLimit) {
      return NextResponse.json(
        { error: "Too many setup attempts. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    if (await hasConfiguredAdminPassword()) {
      return NextResponse.json(
        { error: "Admin account is already configured." },
        { status: 409 },
      );
    }

    const validation = setupSchema.safeParse(body);

    if (!validation.success) {
      await recordAuthFailure("setup", submittedEmail);
      await delayFailedAuthResponse();

      return NextResponse.json(
        { error: "Invalid setup payload." },
        { status: 400 },
      );
    }

    const { name, email, password } = validation.data;
    const normalizedEmail = normalizeEmail(email);
    const passwordHash = await hashPassword(password);
    const configuredAdmin = await getConfiguredAdmin();

    const admin = configuredAdmin
      ? await prisma.user.update({
          where: {
            id: configuredAdmin.id,
          },
          data: {
            name: name || configuredAdmin.name,
            email: normalizedEmail,
            role: "OWNER",
            active: true,
            passwordHash,
          },
        })
      : await prisma.user.upsert({
          where: {
            email: normalizedEmail,
          },
          update: {
            name: name || undefined,
            role: "OWNER",
            active: true,
            passwordHash,
          },
          create: {
            name: name || null,
            email: normalizedEmail,
            role: "OWNER",
            active: true,
            passwordHash,
          },
        });

    await clearAuthFailures("setup", normalizedEmail);
    await createAdminSession(admin.id);

    return NextResponse.json(
      { ok: true },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Error configuring admin:", error);
    return NextResponse.json(
      { error: "Failed to configure admin." },
      { status: 500 },
    );
  }
}
