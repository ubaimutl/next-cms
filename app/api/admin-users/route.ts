import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  canAssignAdminRole,
  canManageAdminUsers,
} from "@/lib/admin-permissions";
import {
  getAuthenticatedAdmin,
  hashPassword,
  normalizeEmail,
} from "@/lib/auth";
import prisma from "@/lib/prisma";

const adminRoleSchema = z.enum(["OWNER", "ADMIN", "EDITOR"]);

const createAdminUserSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.email(),
  password: z.string().min(12).max(200),
  role: adminRoleSchema.default("EDITOR"),
  active: z.boolean().optional().default(true),
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

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!canManageAdminUsers(admin)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["OWNER", "ADMIN", "EDITOR"],
        },
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
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

    return NextResponse.json(users.map(serializeAdminUser), { status: 200 });
  } catch (error) {
    console.error("Error loading admin users:", error);
    return NextResponse.json(
      { error: "Failed to load admin users." },
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

    if (!canManageAdminUsers(admin)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();
    const validation = createAdminUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid admin user payload." },
        { status: 400 },
      );
    }

    const { name, email, password, role, active } = validation.data;

    if (!canAssignAdminRole(admin, role)) {
      return NextResponse.json(
        { error: "This role cannot be assigned from the admin workspace." },
        { status: 403 },
      );
    }

    const normalizedEmail = normalizeEmail(email);
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email: normalizedEmail,
        passwordHash,
        role,
        active,
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

    return NextResponse.json(serializeAdminUser(user), { status: 201 });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: "Failed to create admin user." },
      { status: 500 },
    );
  }
}
