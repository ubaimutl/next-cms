import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedAdmin } from "@/lib/auth";
import { normalizeContactMessageRecord } from "@/lib/db-json";
import prisma from "@/lib/prisma";

const updateContactStatusSchema = z.object({
  status: z.enum(["NEW", "READ", "ARCHIVED"]),
});

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
    const messageId = Number(id);

    if (!Number.isInteger(messageId)) {
      return NextResponse.json(
        { error: "Invalid message id" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validation = updateContactStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const existingMessage = await prisma.contactMessage.findUnique({
      where: { id: messageId },
      select: { id: true, readAt: true },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const nextStatus = validation.data.status;
    const nextReadAt =
      nextStatus === "NEW" ? null : (existingMessage.readAt ?? new Date());

    const message = await prisma.contactMessage.update({
      where: { id: messageId },
      data: {
        status: nextStatus,
        readAt: nextReadAt,
      },
    });

    return NextResponse.json(normalizeContactMessageRecord(message), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating contact message:", error);
    return NextResponse.json(
      { error: "Failed to update contact message" },
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
    const messageId = Number(id);

    if (!Number.isInteger(messageId)) {
      return NextResponse.json(
        { error: "Invalid message id" },
        { status: 400 },
      );
    }

    const existingMessage = await prisma.contactMessage.findUnique({
      where: { id: messageId },
      select: { id: true },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    await prisma.contactMessage.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ id: messageId }, { status: 200 });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return NextResponse.json(
      { error: "Failed to delete contact message" },
      { status: 500 },
    );
  }
}
