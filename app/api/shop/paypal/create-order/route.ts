import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal";
import prisma from "@/lib/prisma";
import { getPublicModuleSettings } from "@/lib/settings";
import { SHOP_BRIEF_MIN_LENGTH } from "@/lib/shop-helpers";

export const runtime = "nodejs";

const requestSchema = z.object({
  productId: z.number().int().positive(),
  buyerBrief: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const settings = await getPublicModuleSettings();

    if (!settings.shopEnabled) {
      return NextResponse.json(
        { error: "Shop is currently unavailable." },
        { status: 404 },
      );
    }

    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: "PayPal is not configured." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: validation.error.format() },
        { status: 400 },
      );
    }

    const product = await prisma.shopProduct.findUnique({
      where: {
        id: validation.data.productId,
      },
    });

    if (!product || !product.active) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    if (product.availability !== "AVAILABLE") {
      return NextResponse.json(
        { error: "This product is not available for purchase right now." },
        { status: 400 },
      );
    }

    const buyerBrief = validation.data.buyerBrief?.trim() || null;

    if (
      product.requiresBrief &&
      (!buyerBrief || buyerBrief.length < SHOP_BRIEF_MIN_LENGTH)
    ) {
      return NextResponse.json(
        { error: "Please add a short brief before checkout." },
        { status: 400 },
      );
    }

    const order = await createPayPalOrder({
      productId: product.id,
      title: product.title,
      amountCents: product.priceCents,
      currency: product.currency,
    });

    await prisma.shopOrder.create({
      data: {
        product: {
          connect: {
            id: product.id,
          },
        },
        status: order.status === "CREATED" ? "PENDING" : "FAILED",
        paypalOrderId: order.id,
        amountCents: product.priceCents,
        currency: product.currency,
        buyerBrief,
      },
    });

    return NextResponse.json({ id: order.id }, { status: 200 });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create PayPal order.",
      },
      { status: 500 },
    );
  }
}
