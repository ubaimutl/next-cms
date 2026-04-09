import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/auth";
import {
  cleanupManagedMediaUrl,
  getMediaUsageCount,
} from "@/lib/media-library";
import prisma from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const mediaId = Number(id);

    if (!Number.isInteger(mediaId)) {
      return NextResponse.json({ error: "Invalid media id." }, { status: 400 });
    }

    const asset = await prisma.mediaAsset.findUnique({
      where: {
        id: mediaId,
      },
      select: {
        id: true,
        url: true,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    const usageCount = await getMediaUsageCount(asset.url);

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error: "This asset is still used by existing content.",
          usageCount,
        },
        { status: 409 },
      );
    }

    await cleanupManagedMediaUrl(asset.url);

    return NextResponse.json({ id: mediaId }, { status: 200 });
  } catch (error) {
    console.error("Error deleting media asset:", error);
    return NextResponse.json(
      { error: "Failed to delete media asset." },
      { status: 500 },
    );
  }
}
