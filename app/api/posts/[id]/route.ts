import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedAdmin } from "@/lib/auth";
import { deleteStoredImage } from "@/lib/media-storage";
import { getPlainTextFromHtml } from "@/lib/post-content";
import { createUniquePostSlug } from "@/lib/post-slug";
import prisma from "@/lib/prisma";
import { getPublicModuleSettings } from "@/lib/settings";

const updatePostSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z
    .string()
    .min(1, "Content is required")
    .refine((value) => getPlainTextFromHtml(value).length > 0, {
      message: "Content is required",
    }),
  featuredImage: z
    .string()
    .trim()
    .max(191, "Featured image path is too long")
    .optional()
    .nullable()
    .transform((value) => (value && value.trim() ? value.trim() : null)),
  published: z.boolean().optional().default(false),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAuthenticatedAdmin();
    const settings = await getPublicModuleSettings();
    const { id } = await params;
    const postId = Number(id);

    if (!Number.isInteger(postId)) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || (!admin && (!settings.blogEnabled || !post.published))) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
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
    const postId = Number(id);

    if (!Number.isInteger(postId)) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    const body = await request.json();
    const validation = updatePostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 },
      );
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, featuredImage: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const { title, content, featuredImage, published } = validation.data;
    const slug = await createUniquePostSlug(title, {
      excludeId: postId,
      prisma,
    });

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        slug,
        content,
        featuredImage,
        published,
      },
    });

    if (
      existingPost.featuredImage &&
      existingPost.featuredImage !== post.featuredImage
    ) {
      try {
        await deleteStoredImage(existingPost.featuredImage);
      } catch (cleanupError) {
        console.error(
          "Error deleting previous post image:",
          cleanupError,
        );
      }
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
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
    const postId = Number(id);

    if (!Number.isInteger(postId)) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, featuredImage: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    if (existingPost.featuredImage) {
      try {
        await deleteStoredImage(existingPost.featuredImage);
      } catch (cleanupError) {
        console.error("Error deleting post image:", cleanupError);
      }
    }

    return NextResponse.json({ id: postId }, { status: 200 });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 },
    );
  }
}
