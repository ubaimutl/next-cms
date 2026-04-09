import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/auth";
import { listAdminMediaAssets } from "@/lib/media-library";

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const assets = await listAdminMediaAssets();
    return NextResponse.json(assets, { status: 200 });
  } catch (error) {
    console.error("Error fetching media assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch media assets." },
      { status: 500 },
    );
  }
}
