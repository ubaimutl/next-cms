import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/auth";
import { registerMediaAsset } from "@/lib/media-library";
import { storeUploadedImage, validateUploadEntry } from "@/lib/media-storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const validation = validateUploadEntry(formData.get("file"));

    if ("error" in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status },
      );
    }

    const storedImage = await storeUploadedImage(
      validation.file,
      "posts",
      validation.extension,
    );

    const asset = await registerMediaAsset({
      storedImage,
      kind: "posts",
      uploadedById: admin.id,
    });

    return NextResponse.json(
      { id: asset.id, url: storedImage.url },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error uploading post image:", error);
    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 },
    );
  }
}
