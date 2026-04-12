import type { Metadata } from "next";

import { requireAuthenticatedAdmin } from "@/lib/auth";
import {
  canAccessAdminOperations,
  canManageAdminUsers,
} from "@/lib/admin-permissions";
import {
  normalizeContactMessageRecord,
  normalizeProjectRecord,
  normalizeShopProductRecord,
} from "@/lib/db-json";
import { listAdminMediaAssets } from "@/lib/media-library";
import prisma, { type AnalyticsOverview, getAnalyticsOverview } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";

import type {
  AdminMediaAsset,
  AdminMessage,
  AdminOrder,
  AdminUser,
} from "./components/types";

import AdminWorkspace from "./AdminWorkspace";

type AdminAnalyticsOverview = AnalyticsOverview;
type AdminProductRecord = {
  id: number;
  title: string;
  slug?: string | null;
};

export const metadata: Metadata = {
  title: "Admin",
  description:
    "Authenticated publishing workspace for managing private admin tools.",
  alternates: {
    canonical: "/admin",
  },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAuthenticatedAdmin();
  const canAccessOperations = canAccessAdminOperations(admin);
  const canManageUsers = canManageAdminUsers(admin);
  const [posts, projects, products, orders, messages, mediaAssets, analytics, settings, users] =
    await Promise.all([
    prisma.post.findMany({
      orderBy: {
        id: "desc",
      },
    }),
    prisma.project.findMany({
      orderBy: {
        id: "desc",
      },
    }),
    prisma.shopProduct.findMany({
      orderBy: {
        id: "desc",
      },
    }),
    canAccessOperations
      ? prisma.shopOrder.findMany({
          orderBy: {
            createdAt: "desc",
          },
        })
      : Promise.resolve([]),
    canAccessOperations
      ? prisma.contactMessage.findMany({
          orderBy: {
            createdAt: "desc",
          },
        })
      : Promise.resolve([]),
    listAdminMediaAssets(),
    canAccessOperations
      ? getAnalyticsOverview()
      : Promise.resolve({
          enabled: false,
          totalPageViews: 0,
          totalVisits: 0,
          postPageViews: 0,
          pageViewsLast7Days: 0,
          visitsLast7Days: 0,
          topPages: [],
          topPosts: [],
          postViewCounts: {},
        }),
    getAppSettings(),
    canManageUsers
      ? prisma.user.findMany({
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
        })
      : Promise.resolve([]),
  ]);

  return (
    <AdminWorkspace
      initialPosts={posts}
      initialProjects={projects.map(normalizeProjectRecord)}
      initialProducts={products.map(normalizeShopProductRecord)}
      initialOrders={orders.map((order): AdminOrder => {
        const product = products.find(
          (entry: AdminProductRecord) => entry.id === Number(order.productId),
        );

        return {
          id: order.id,
          productId: order.productId,
          productTitle: product?.title ?? `Product #${String(order.productId)}`,
          productSlug:
            product && "slug" in product && typeof product.slug === "string"
              ? product.slug
              : null,
          status: order.status,
          paypalOrderId: order.paypalOrderId,
          paypalCaptureId: order.paypalCaptureId,
          amountCents: order.amountCents,
          currency: order.currency,
          buyerEmail: order.buyerEmail,
          buyerName: order.buyerName,
          buyerBrief: order.buyerBrief,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        };
      })}
      initialMessages={messages.map((message): AdminMessage => {
        const normalizedMessage = normalizeContactMessageRecord(message);

        return {
          id: normalizedMessage.id,
          name: normalizedMessage.name,
          email: normalizedMessage.email,
          company: normalizedMessage.company,
          website: normalizedMessage.website,
          services: normalizedMessage.services,
          budget: normalizedMessage.budget,
          timeline: normalizedMessage.timeline,
          message: normalizedMessage.message,
          status: normalizedMessage.status,
          emailError: normalizedMessage.emailError,
          createdAt: normalizedMessage.createdAt.toISOString(),
          readAt: normalizedMessage.readAt?.toISOString() ?? null,
          emailSentAt: normalizedMessage.emailSentAt?.toISOString() ?? null,
        };
      })}
      initialMediaAssets={mediaAssets.map(
        (asset): AdminMediaAsset => ({
          ...asset,
        }),
      )}
      initialAnalytics={analytics as AdminAnalyticsOverview}
      initialSettings={{
        id: settings.id,
        blogEnabled: settings.blogEnabled,
        projectsEnabled: settings.projectsEnabled,
        shopEnabled: settings.shopEnabled,
        createdAt: settings.createdAt.toISOString(),
        updatedAt: settings.updatedAt.toISOString(),
      }}
      initialUsers={users.map(
        (user): AdminUser => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          active: user.active,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }),
      )}
      admin={{
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        active: admin.active,
      }}
    />
  );
}
