import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { canManageAdminUsers } from "@/lib/admin-permissions";
import {
  getAuthenticatedAdmin,
  hashPassword,
  normalizeEmail,
} from "@/lib/auth";
import prisma from "@/lib/prisma";

const adminRoleSchema = z.enum(["OWNER", "ADMIN", "EDITOR"]);

const updateAdminUserSchema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.email().optional(),
  password: z.string().min(12).max(200).optional(),
  role: adminRoleSchema.optional(),
  active: z.boolean().optional(),
});

function serializeAdminUser(user: {
  id: number;
  email: string;
  name: string | null;
  role: "OWNER" | "ADMIN" | "EDITOR";
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function parseUserId(id: string) {
  const userId = Number(id);
  return Number.isInteger(userId) ? userId : null;
}

async function ensureUserManagementAccess() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return {
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
      admin: null,
    };
  }

  if (!canManageAdminUsers(admin)) {
    return {
      error: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
      admin: null,
    };
  }

  return { error: null, admin };
}

async function ensureOwnerSafety(
  userId: number,
  nextRole?: "OWNER" | "ADMIN" | "EDITOR",
  nextActive?: boolean,
) {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
      active: true,
    },
  });

  if (!existingUser) {
    return {
      error: NextResponse.json({ error: "Admin user not found." }, { status: 404 }),
      existingUser: null,
    };
  }

  const isOwner = existingUser.role === "OWNER";
  const willRemainOwner = nextRole ? nextRole === "OWNER" : isOwner;
  const willRemainActive = nextActive ?? existingUser.active;

  if (isOwner && (!willRemainOwner || !willRemainActive)) {
    const ownerCount = await prisma.user.count({
      where: {
        role: "OWNER",
        active: true,
      },
    });

    if (ownerCount <= 1) {
      return {
        error: NextResponse.json(
          { error: "At least one active owner is required." },
          { status: 400 },
        ),
        existingUser,
      };
    }
  }

  return { error: null, existingUser };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const access = await ensureUserManagementAccess();
    if (access.error || !access.admin) return access.error;

    const { id } = await params;
    const userId = parseUserId(id);

    if (userId === null) {
      return NextResponse.json({ error: "Invalid admin user id." }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateAdminUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid admin user payload." },
        { status: 400 },
      );
    }

    if (access.admin.id === userId && validation.data.active === false) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account." },
        { status: 400 },
      );
    }

    const safety = await ensureOwnerSafety(
      userId,
      validation.data.role,
      validation.data.active,
    );

    if (safety.error || !safety.existingUser) return safety.error;

    const nextEmail = validation.data.email
      ? normalizeEmail(validation.data.email)
      : undefined;
    const nextPasswordHash = validation.data.password
      ? await hashPassword(validation.data.password)
      : undefined;

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(validation.data.name !== undefined
          ? { name: validation.data.name || null }
          : {}),
        ...(nextEmail ? { email: nextEmail } : {}),
        ...(validation.data.role ? { role: validation.data.role } : {}),
        ...(validation.data.active !== undefined
          ? { active: validation.data.active }
          : {}),
        ...(nextPasswordHash ? { passwordHash: nextPasswordHash } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(serializeAdminUser(updatedUser), { status: 200 });
  } catch (error) {
    console.error("Error updating admin user:", error);
    return NextResponse.json(
      { error: "Failed to update admin user." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const access = await ensureUserManagementAccess();
    if (access.error || !access.admin) return access.error;

    const { id } = await params;
    const userId = parseUserId(id);

    if (userId === null) {
      return NextResponse.json({ error: "Invalid admin user id." }, { status: 400 });
    }

    if (access.admin.id === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 },
      );
    }

    const safety = await ensureOwnerSafety(userId, "EDITOR", false);

    if (safety.error || !safety.existingUser) return safety.error;

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({ id: userId }, { status: 200 });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json(
      { error: "Failed to delete admin user." },
      { status: 500 },
    );
  }
}
