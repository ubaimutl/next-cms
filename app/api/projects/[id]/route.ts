import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedAdmin } from "@/lib/auth";
import { normalizeProjectRecord, writeStringList } from "@/lib/db-json";
import prisma from "@/lib/prisma";
import { getPublicModuleSettings } from "@/lib/settings";
import { normalizeExternalUrl } from "@/lib/url";

const updateProjectSchema = z.object({
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAuthenticatedAdmin();
    const settings = await getPublicModuleSettings();
    const { id } = await params;
    const projectId = Number(id);

    if (!Number.isInteger(projectId)) {
      return NextResponse.json(
        { error: "Invalid project id" },
        { status: 400 },
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || (!admin && !settings.projectsEnabled)) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(normalizeProjectRecord(project), { status: 200 });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
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
    const projectId = Number(id);

    if (!Number.isInteger(projectId)) {
      return NextResponse.json(
        { error: "Invalid project id" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validation = updateProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 },
      );
    }

    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { title, description, tags, images, link } = validation.data;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        description,
        tags: writeStringList(tags),
        images: writeStringList(images),
        link,
      },
    });

    return NextResponse.json(normalizeProjectRecord(project), { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
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
    const projectId = Number(id);

    if (!Number.isInteger(projectId)) {
      return NextResponse.json(
        { error: "Invalid project id" },
        { status: 400 },
      );
    }

    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ id: projectId }, { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
