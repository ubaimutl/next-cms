import { NextRequest, NextResponse } from "next/server";

import { clearAdminSession, isTrustedAuthRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    if (!isTrustedAuthRequest(request)) {
      return NextResponse.json(
        { error: "Untrusted authentication request." },
        { status: 403 },
      );
    }

    await clearAdminSession();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error logging out admin:", error);
    return NextResponse.json({ error: "Failed to logout." }, { status: 500 });
  }
}
