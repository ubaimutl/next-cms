import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedAdmin } from "@/lib/auth";
import { getPlainTextFromHtml, sanitizeRichHtml } from "@/lib/post-content";
import { createUniquePostSlug } from "@/lib/post-slug";
import prisma from "@/lib/prisma";
import { getPublicModuleSettings } from "@/lib/settings";

const createPostSchema = z.object({
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
  seoTitle: z
    .string()
    .trim()
    .max(191, "SEO title is too long")
    .optional()
    .nullable()
    .transform((value) => (value && value.trim() ? value.trim() : null)),
  seoDescription: z
    .string()
    .trim()
    .max(320, "SEO description is too long")
    .optional()
    .nullable()
    .transform((value) => (value && value.trim() ? value.trim() : null)),
  seoImage: z
    .string()
    .trim()
    .max(2048, "SEO image URL is too long")
    .optional()
    .nullable()
    .transform((value) => (value && value.trim() ? value.trim() : null)),
  published: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    const settings = await getPublicModuleSettings();

    if (!admin && !settings.blogEnabled) {
      return NextResponse.json([], { status: 200 });
    }

    const posts = await prisma.post.findMany({
      ...(admin ? {} : { where: { published: true } }),
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
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
    const validation = createPostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 },
      );
    }

    const { title, content, featuredImage, seoTitle, seoDescription, seoImage, published } = validation.data;
    const sanitizedContent = sanitizeRichHtml(content);

    if (getPlainTextFromHtml(sanitizedContent).length === 0) {
      return NextResponse.json(
        { error: "Invalid input", details: { content: ["Content is required"] } },
        { status: 400 },
      );
    }

    const slug = await createUniquePostSlug(title, { prisma });

    const newPost = await prisma.post.create({
      data: {
        title,
        slug,
        content: sanitizedContent,
        featuredImage,
        seoTitle,
        seoDescription,
        seoImage,
        published,
        author: {
          connect: { id: admin.id },
        },
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}
