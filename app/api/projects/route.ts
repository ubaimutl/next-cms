import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedAdmin } from "@/lib/auth";
import { normalizeProjectRecord, writeStringList } from "@/lib/db-json";
import prisma from "@/lib/prisma";
import { getPublicModuleSettings } from "@/lib/settings";
import { normalizeExternalUrl } from "@/lib/url";

const createProjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  tags: z
    .array(z.string().trim().min(1))
    .min(1, "At least one tag is required"),
  images: z
    .array(z.string().trim().min(1))
    .min(1, "At least one image is required"),
  link: z
    .string()
    .trim()
    .optional()
    .transform((value) => normalizeExternalUrl(value)),
});

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    const settings = await getPublicModuleSettings();

    if (!admin && !settings.projectsEnabled) {
      return NextResponse.json([], { status: 200 });
    }

    const projects = await prisma.project.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(projects.map(normalizeProjectRecord), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
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
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 },
      );
    }

    const { title, description, tags, images, link } = validation.data;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        tags: writeStringList(tags),
        images: writeStringList(images),
        link,
      },
    });

    return NextResponse.json(normalizeProjectRecord(project), { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
