import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedAdmin } from "@/lib/auth";
import { normalizeShopProductRecord, writeStringList } from "@/lib/db-json";
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

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    const settings = await getPublicModuleSettings();

    if (!admin && !settings.shopEnabled) {
      return NextResponse.json([], { status: 200 });
    }

    const products = await prisma.shopProduct.findMany({
      ...(admin ? {} : { where: { active: true } }),
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(
      products.map(normalizeShopProductRecord),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 },
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
    const slug = await createUniqueShopProductSlug(title, { prisma });

    const product = await prisma.shopProduct.create({
      data: {
        title,
        slug,
        summary,
        content,
        priceCents,
        currency: "EUR",
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

    return NextResponse.json(normalizeShopProductRecord(product), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 },
    );
  }
}
