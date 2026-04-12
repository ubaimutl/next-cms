import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { clearAdminSession, isTrustedAuthRequest } from "@/lib/auth";
import { consumePasswordChangeToken } from "@/lib/password-change";

const passwordChangeConfirmSchema = z.object({
  token: z.string().trim().min(1).max(512),
});

export async function POST(request: NextRequest) {
  try {
    if (!isTrustedAuthRequest(request)) {
      return NextResponse.json(
        { error: "Untrusted authentication request." },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => null);
    const validation = passwordChangeConfirmSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid confirmation token." },
        { status: 400 },
      );
    }

    const result = await consumePasswordChangeToken(validation.data.token);

    if (!result.ok) {
      const message =
        result.reason === "expired"
          ? "This confirmation link has expired."
          : result.reason === "used"
            ? "This confirmation link has already been used."
            : result.reason === "inactive"
              ? "This account is inactive."
              : "This confirmation link is invalid.";

      return NextResponse.json({ error: message }, { status: 400 });
    }

    await clearAdminSession();

    return NextResponse.json(
      {
        ok: true,
        message: "Password changed. Sign in again with the new password.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Error confirming password change:", error);
    return NextResponse.json(
      { error: "Failed to confirm password change." },
      { status: 500 },
    );
  }
}
