import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { canManageSettings } from "@/lib/admin-permissions";
import {
  getAuthenticatedAdmin,
} from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import prisma from "@/lib/prisma";

const updateSettingsSchema = z.object({
  blogEnabled: z.boolean().optional(),
  projectsEnabled: z.boolean().optional(),
  shopEnabled: z.boolean().optional(),
});

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const settings = await getAppSettings();

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error loading app settings:", error);
    return NextResponse.json(
      { error: "Failed to load app settings." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!canManageSettings(admin)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid settings payload." },
        { status: 400 },
      );
    }

    const settings = await prisma.appSettings.upsert({
      where: {
        id: 1,
      },
      update: validation.data,
      create: {
        id: 1,
        ...validation.data,
      },
    });

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error updating app settings:", error);
    return NextResponse.json(
      { error: "Failed to update app settings." },
      { status: 500 },
    );
  }
}
