import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedAdmin, hashPassword, isTrustedAuthRequest, verifyPassword } from "@/lib/auth";
import { sendPasswordChangeEmail } from "@/lib/mail";
import {
  buildPasswordChangeConfirmUrl,
  clearPasswordChangeTokensForUser,
  createPasswordChangeToken,
} from "@/lib/password-change";

const passwordChangeRequestSchema = z.object({
  currentPassword: z.string().min(8).max(200),
  newPassword: z.string().min(12).max(200),
});

export async function POST(request: NextRequest) {
  try {
    if (!isTrustedAuthRequest(request)) {
      return NextResponse.json(
        { error: "Untrusted authentication request." },
        { status: 403 },
      );
    }

    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!admin.passwordHash) {
      return NextResponse.json(
        { error: "This account does not have a password set." },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => null);
    const validation = passwordChangeRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid password change request." },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = validation.data;
    const currentPasswordMatches = await verifyPassword(
      currentPassword,
      admin.passwordHash,
    );

    if (!currentPasswordMatches) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 },
      );
    }

    const reusesCurrentPassword = await verifyPassword(
      newPassword,
      admin.passwordHash,
    );

    if (reusesCurrentPassword) {
      return NextResponse.json(
        { error: "Choose a new password that differs from the current password." },
        { status: 400 },
      );
    }

    const pendingPasswordHash = await hashPassword(newPassword);
    const { token } = await createPasswordChangeToken(
      admin.id,
      pendingPasswordHash,
    );
    const confirmUrl = buildPasswordChangeConfirmUrl(token);

    try {
      await sendPasswordChangeEmail({
        to: admin.email,
        name: admin.name,
        confirmUrl,
      });
    } catch (error) {
      await clearPasswordChangeTokensForUser(admin.id);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to send the confirmation email.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Confirmation email sent. Open the link in your inbox to finish the password change.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Error requesting password change:", error);
    return NextResponse.json(
      { error: "Failed to request password change." },
      { status: 500 },
    );
  }
}
