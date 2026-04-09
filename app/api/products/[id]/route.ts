import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedAdmin } from "@/lib/auth";
import {
  normalizeShopProductRecord,
  readStringList,
  writeStringList,
} from "@/lib/db-json";
import { cleanupManagedMediaUrls } from "@/lib/media-library";
import { getPlainTextFromHtml } from "@/lib/post-content";
import { createUniqueShopProductSlug } from "@/lib/post-slug";
import prisma from "@/lib/prisma";
import { getPublicModuleSettings } from "@/lib/settings";

const productSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  summary: z.string().trim().min(1, "Summary is required"),
  content: z
    .string()
    .min(1, "Content is required")
    .refine((value) => getPlainTextFromHtml(value).length > 0, {
      message: "Content is required",
    }),
  priceCents: z.number().int().positive("Price must be greater than zero"),
  kind: z.enum(["SERVICE", "DIGITAL"]),
  active: z.boolean().optional().default(true),
  availability: z
    .enum(["AVAILABLE", "COMING_SOON", "SOLD_OUT"])
    .optional()
    .default("AVAILABLE"),
  requiresBrief: z.boolean().optional().default(false),
  briefPrompt: z.string().trim().optional(),
  deliveryText: z.string().trim().optional(),
  highlights: z
    .array(z.string().trim().min(1))
    .min(1, "At least one highlight is required"),
  images: z
    .array(z.string().trim().min(1))
    .min(1, "At least one image is required"),
});

function parseProductId(id: string) {
  const productId = Number(id);

  return Number.isInteger(productId) ? productId : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAuthenticatedAdmin();
    const settings = await getPublicModuleSettings();
    const { id } = await params;
    const productId = parseProductId(id);

    if (productId === null) {
      return NextResponse.json(
        { error: "Invalid product id." },
        { status: 400 },
      );
    }

    const product = await prisma.shopProduct.findUnique({
      where: {
        id: productId,
      },
    });

    if (
      !product ||
      (!admin && (!settings.shopEnabled || !product.active))
    ) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(normalizeShopProductRecord(product), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseProductId(id);

    if (productId === null) {
      return NextResponse.json(
        { error: "Invalid product id." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 },
      );
    }

    const existingProduct = await prisma.shopProduct.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        images: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    const {
      title,
      summary,
      content,
      priceCents,
      kind,
      active,
      availability,
      requiresBrief,
      briefPrompt,
      deliveryText,
      highlights,
      images,
    } = validation.data;
    const previousImages = readStringList(existingProduct.images);
    const slug = await createUniqueShopProductSlug(title, {
      excludeId: productId,
      prisma,
    });

    const product = await prisma.shopProduct.update({
      where: {
        id: productId,
      },
      data: {
        title,
        slug,
        summary,
        content,
        priceCents,
        kind,
        active,
        availability,
        requiresBrief,
        briefPrompt: requiresBrief ? briefPrompt || null : null,
        deliveryText: deliveryText || null,
        highlights: writeStringList(highlights),
        images: writeStringList(images),
      },
    });

    const removedImages = previousImages.filter(
      (image) => !images.includes(image),
    );

    if (removedImages.length > 0) {
      try {
        await cleanupManagedMediaUrls(removedImages);
      } catch (cleanupError) {
        console.error("Error deleting removed product images:", cleanupError);
      }
    }

    return NextResponse.json(normalizeShopProductRecord(product), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product." },
      { status: 500 },
    );
  }
}

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
    const productId = parseProductId(id);

    if (productId === null) {
      return NextResponse.json(
        { error: "Invalid product id." },
        { status: 400 },
      );
    }

    const existingProduct = await prisma.shopProduct.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        images: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    await prisma.shopProduct.delete({
      where: {
        id: productId,
      },
    });

    const existingImages = readStringList(existingProduct.images);

    if (existingImages.length > 0) {
      try {
        await cleanupManagedMediaUrls(existingImages);
      } catch (cleanupError) {
        console.error("Error deleting product images:", cleanupError);
      }
    }

    return NextResponse.json({ id: productId }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product." },
      { status: 500 },
    );
  }
}
