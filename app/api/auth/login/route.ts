import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  clearAuthFailures,
  createAdminSession,
  delayFailedAuthResponse,
  ensureAuthRateLimitAvailable,
  isTrustedAuthRequest,
  normalizeEmail,
  recordAuthFailure,
  verifyPassword,
} from "@/lib/auth";
import prisma from "@/lib/prisma";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(200),
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
      | { email?: unknown; password?: unknown }
      | null;
    const submittedEmail =
      typeof body?.email === "string" ? normalizeEmail(body.email) : null;
    const rateLimit = await ensureAuthRateLimitAvailable("login", submittedEmail);

    if (rateLimit) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      await recordAuthFailure("login", submittedEmail);
      await delayFailedAuthResponse();

      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 400 },
      );
    }

    const { email, password } = validation.data;
    const normalizedEmail = normalizeEmail(email);
    const admin = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        active: true,
        role: {
          in: ["OWNER", "ADMIN", "EDITOR"],
        },
      },
    });

    if (!admin?.passwordHash) {
      await recordAuthFailure("login", normalizedEmail);
      await delayFailedAuthResponse();

      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    const isValid = await verifyPassword(password, admin.passwordHash);

    if (!isValid) {
      await recordAuthFailure("login", normalizedEmail);
      await delayFailedAuthResponse();

      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    await clearAuthFailures("login", normalizedEmail);
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
    console.error("Error logging in admin:", error);
    return NextResponse.json({ error: "Failed to login." }, { status: 500 });
  }
}
