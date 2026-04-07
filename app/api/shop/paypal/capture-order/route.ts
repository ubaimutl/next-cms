import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const requestSchema = z.object({
  orderId: z.string().trim().min(1),
});

function normalizeOrderStatus(status: string) {
  if (status === "COMPLETED") {
    return "COMPLETED" as const;
  }

  if (status === "VOIDED") {
    return "CANCELED" as const;
  }

  return "FAILED" as const;
}

export async function POST(request: NextRequest) {
  try {
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

    const existingOrder = await prisma.shopOrder.findUnique({
      where: {
        paypalOrderId: validation.data.orderId,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 },
      );
    }

    if (existingOrder.status === "COMPLETED") {
      return NextResponse.json(
        {
          status: existingOrder.status,
          paypalOrderId: existingOrder.paypalOrderId,
          paypalCaptureId: existingOrder.paypalCaptureId,
        },
        { status: 200 },
      );
    }

    const capture = await capturePayPalOrder(validation.data.orderId);
    const captureId =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
    const payerName = [
      capture.payer?.name?.given_name,
      capture.payer?.name?.surname,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    const updatedOrder = await prisma.shopOrder.update({
      where: {
        paypalOrderId: validation.data.orderId,
      },
      data: {
        status: normalizeOrderStatus(capture.status),
        paypalCaptureId: captureId,
        buyerEmail: capture.payer?.email_address ?? null,
        buyerName: payerName || null,
      },
    });

    return NextResponse.json(
      {
        status: updatedOrder?.status ?? normalizeOrderStatus(capture.status),
        paypalOrderId: validation.data.orderId,
        paypalCaptureId: captureId,
        buyerEmail: capture.payer?.email_address ?? null,
        buyerName: payerName || null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to capture PayPal order.",
      },
      { status: 500 },
    );
  }
}
