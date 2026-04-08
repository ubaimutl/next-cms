import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

import { PrismaClient } from "@/app/generated/prisma/client";

export type AnalyticsTopPage = {
  path: string;
  views: number;
};

export type AnalyticsTopPost = {
  slug: string;
  title: string;
  views: number;
};

export type AnalyticsOverview = {
  enabled: boolean;
  totalPageViews: number;
  totalVisits: number;
  postPageViews: number;
  pageViewsLast7Days: number;
  visitsLast7Days: number;
  topPages: AnalyticsTopPage[];
  topPosts: AnalyticsTopPost[];
  postViewCounts: Record<string, number>;
};

const ANALYTICS_DEDUP_WINDOW_SECONDS = 15;

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function isPrismaErrorWithCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    error.code === code
  );
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  if (databaseUrl.startsWith("prisma://")) {
    return new PrismaClient({
      accelerateUrl: databaseUrl,
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;

function sortCountEntriesDescending(entries: Map<string, number>) {
  return [...entries.entries()].sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }

    return left[0].localeCompare(right[0]);
  });
}

export async function getAnalyticsSettings() {
  const existingSettings = await prisma.analyticsSettings.findUnique({
    where: {
      id: 1,
    },
  });

  if (existingSettings) {
    return existingSettings;
  }

  try {
    return await prisma.analyticsSettings.create({
      data: {
        id: 1,
        enabled: false,
      },
    });
  } catch (error) {
    if (!isPrismaErrorWithCode(error, "P2002")) {
      throw error;
    }

    return prisma.analyticsSettings.findUniqueOrThrow({
      where: {
        id: 1,
      },
    });
  }
}

export async function setAnalyticsEnabled(enabled: boolean) {
  return prisma.analyticsSettings.upsert({
    where: {
      id: 1,
    },
    create: {
      id: 1,
      enabled,
    },
    update: {
      enabled,
    },
  });
}

export async function recordAnalyticsPageView(args: {
  path: string;
  postSlug: string | null;
  visitorToken: string;
}) {
  const settings = await getAnalyticsSettings();

  if (!settings.enabled) {
    return { enabled: false, tracked: false } as const;
  }

  const dedupeThreshold = new Date(
    Date.now() - ANALYTICS_DEDUP_WINDOW_SECONDS * 1000,
  );

  const existing = await prisma.analyticsPageView.findFirst({
    where: {
      path: args.path,
      visitorToken: args.visitorToken,
      createdAt: {
        gte: dedupeThreshold,
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  if (existing) {
    return {
      enabled: true,
      tracked: false,
      pageView: existing,
    } as const;
  }

  const pageView = await prisma.analyticsPageView.create({
    data: {
      path: args.path,
      postSlug: args.postSlug,
      visitorToken: args.visitorToken,
    },
  });

  return {
    enabled: true,
    tracked: true,
    pageView,
  } as const;
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const settings = await getAnalyticsSettings();
  const sevenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

  const [pageViews, posts] = await Promise.all([
    prisma.analyticsPageView.findMany({
      select: {
        path: true,
        postSlug: true,
        visitorToken: true,
        createdAt: true,
      },
    }),
    prisma.post.findMany({
      select: {
        slug: true,
        title: true,
      },
    }),
  ]);

  const totalPageViews = pageViews.length;
  const totalVisits = new Set(pageViews.map((entry) => entry.visitorToken)).size;
  const postPageViews = pageViews.filter((entry) => entry.postSlug !== null).length;

  const pageViewsLast7DaysEntries = pageViews.filter(
    (entry) => entry.createdAt >= sevenDaysAgo,
  );

  const pageViewsLast7Days = pageViewsLast7DaysEntries.length;
  const visitsLast7Days = new Set(
    pageViewsLast7DaysEntries.map((entry) => entry.visitorToken),
  ).size;

  const pathCounts = new Map<string, number>();
  const postSlugCounts = new Map<string, number>();

  for (const entry of pageViews) {
    pathCounts.set(entry.path, (pathCounts.get(entry.path) ?? 0) + 1);

    if (entry.postSlug) {
      postSlugCounts.set(
        entry.postSlug,
        (postSlugCounts.get(entry.postSlug) ?? 0) + 1,
      );
    }
  }

  const topPages = sortCountEntriesDescending(pathCounts)
    .slice(0, 8)
    .map(([path, views]) => ({ path, views }));

  const titleBySlug = new Map(posts.map((post) => [post.slug, post.title]));
  const sortedPostCounts = sortCountEntriesDescending(postSlugCounts);

  const topPosts = sortedPostCounts.slice(0, 8).map(([slug, views]) => ({
    slug,
    title: titleBySlug.get(slug) ?? slug,
    views,
  }));

  const postViewCounts = Object.fromEntries(sortedPostCounts);

  return {
    enabled: settings.enabled,
    totalPageViews,
    totalVisits,
    postPageViews,
    pageViewsLast7Days,
    visitsLast7Days,
    topPages,
    topPosts,
    postViewCounts,
  };
}
