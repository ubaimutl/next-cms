import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, type Prisma } from "../app/generated/prisma/client";

function toJsonArray(values: string[]): Prisma.InputJsonArray {
  return values as Prisma.InputJsonArray;
}

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
}

function createArticleHtml(title: string, sections: Array<{ heading: string; body: string[] }>) {
  const intro = `<p>${title} is part of the demo dataset for this workspace. The copy is intentionally realistic enough to exercise the frontend layouts, reading views, and metadata surfaces without pretending to be finished editorial work.</p>`;
  const sectionHtml = sections
    .map(
      (section) => `
        <h2>${section.heading}</h2>
        ${section.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      `,
    )
    .join("");

  return `${intro}${sectionHtml}`;
}

const remoteImages = {
  editorialDesk:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
  teamLaptops:
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
  codingSetup:
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
  codeCloseup:
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80",
  strategySession:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
  meetingRoom:
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
  materialSamples:
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
  minimalInterior:
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80",
  planningWall:
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80",
} as const;

type ProductSeed = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  priceCents: number;
  currency: string;
  kind: "SERVICE" | "DIGITAL";
  availability: "AVAILABLE" | "COMING_SOON" | "SOLD_OUT";
  requiresBrief: boolean;
  briefPrompt: string | null;
  deliveryText: string | null;
  highlights: string[];
  images: string[];
};

type MessageSeed = {
  name: string;
  email: string;
  company: string;
  website: string;
  services: string[];
  budget: string;
  timeline: string;
  message: string;
  status: "NEW" | "READ" | "ARCHIVED";
};

const postSeeds = [
  {
    title: "Building a Dark-First Editorial Frontend",
    slug: "demo-dark-first-editorial-frontend",
    featuredImage: remoteImages.editorialDesk,
    content: createArticleHtml("Building a Dark-First Editorial Frontend", [
      {
        heading: "Start with layout, not decoration",
        body: [
          "The fastest way to make a content site feel calmer is to remove competing frames. A narrow reading width, clear spacing rhythm, and one dominant text scale carry more weight than adding more visual treatment.",
          "For this demo, the homepage, archive, and detail templates were shaped as separate experiences. That keeps the site coherent without forcing every section into the same exact module grid.",
        ],
      },
      {
        heading: "A compact header changes the tone",
        body: [
          "Full-width navigation bars tend to make small sites feel like software products. A tighter centered control cluster feels more personal and pushes attention down to the content immediately.",
          "That same logic also applies to action rails and share controls. Fewer controls on screen usually makes the remaining ones feel more deliberate.",
        ],
      },
      {
        heading: "Editorial surfaces need restraint",
        body: [
          "Posts benefit from predictable typography, low-contrast dividers, and side panels that never overpower the reading column. The best post templates are felt more than noticed.",
        ],
      },
    ]),
  },
  {
    title: "Three Ways to Separate Work, Writing, and Commerce",
    slug: "demo-separate-work-writing-commerce",
    featuredImage: remoteImages.strategySession,
    content: createArticleHtml("Three Ways to Separate Work, Writing, and Commerce", [
      {
        heading: "Work should feel visual",
        body: [
          "Project pages want image-led cards, staggered compositions, and quicker supporting copy. The visitor should understand the shape of the work before they start reading.",
        ],
      },
      {
        heading: "Writing should feel quiet",
        body: [
          "Post archives work best when the titles and summaries do most of the talking. The page becomes stronger as the chrome gets lighter and the reading column gets clearer.",
        ],
      },
      {
        heading: "Commerce should feel decisive",
        body: [
          "Product pages need obvious pricing, obvious availability, and obvious next actions. The structure should reduce ambiguity, not invite browsing for its own sake.",
        ],
      },
    ]),
  },
  {
    title: "Designing Portfolio Systems That Age Well",
    slug: "demo-portfolio-systems-that-age-well",
    featuredImage: remoteImages.materialSamples,
    content: createArticleHtml("Designing Portfolio Systems That Age Well", [
      {
        heading: "The system should survive new content",
        body: [
          "A portfolio rarely breaks because one project is weak. It breaks when the layout only works for one type of project and collapses as soon as new material arrives.",
          "Good systems are opinionated enough to create a point of view, but flexible enough to absorb different kinds of work without redesigning the whole site.",
        ],
      },
      {
        heading: "Images carry pace",
        body: [
          "Alternating image density, card sizes, and alignment gives the page rhythm. That rhythm matters more than any single decorative flourish.",
        ],
      },
    ]),
  },
  {
    title: "Notes on Shipping Small Commerce Experiences",
    slug: "demo-shipping-small-commerce-experiences",
    featuredImage: remoteImages.codingSetup,
    content: createArticleHtml("Notes on Shipping Small Commerce Experiences", [
      {
        heading: "Clarity beats novelty",
        body: [
          "Buyers do not need a shop page to feel like a mood board. They need confidence that the offer is real, the pricing is clear, and the next step is obvious.",
        ],
      },
      {
        heading: "Keep the purchase layer small",
        body: [
          "The strongest small commerce pages put the transaction box close to the title and use the rest of the page to answer questions. That keeps the commercial intent visible without overwhelming the content.",
        ],
      },
    ]),
  },
];

const projectSeeds = [
  {
    title: "Northline Journal",
    description:
      "Editorial redesign and CMS migration for a small publication moving from ad-heavy templates to a calmer dark reading experience.",
    tags: ["Editorial", "UX", "Next.js"],
    images: [
      remoteImages.editorialDesk,
      remoteImages.minimalInterior,
    ],
    link: "https://example.com/northline-journal",
  },
  {
    title: "B2Lenen Platform Refresh",
    description:
      "A lean marketing and product front for a lending brand, with simplified navigation and a stronger conversion path across desktop and mobile.",
    tags: ["Product", "Brand", "Frontend"],
    images: [
      remoteImages.meetingRoom,
      remoteImages.teamLaptops,
    ],
    link: "https://example.com/b2lenen-refresh",
  },
  {
    title: "Bfolio Showcase System",
    description:
      "Visual case-study framework for presenting studio work with staggered image blocks, modular sections, and reusable project narratives.",
    tags: ["Portfolio", "System Design", "Showcase"],
    images: [
      remoteImages.materialSamples,
      remoteImages.planningWall,
    ],
    link: "https://example.com/bfolio-showcase",
  },
  {
    title: "Ghost-Inspired Publishing Demo",
    description:
      "Admin and public theme study for a publishing workspace that borrows the calm of editorial tools without copying their interface literally.",
    tags: ["CMS", "Admin UX", "Theme"],
    images: [
      remoteImages.codeCloseup,
      remoteImages.strategySession,
    ],
    link: "https://example.com/ghost-inspired-demo",
  },
];

const productSeeds: ProductSeed[] = [
  {
    title: "Editorial Landing Page Sprint",
    slug: "demo-editorial-landing-page-sprint",
    summary:
      "A focused frontend redesign sprint for a homepage or launch page that needs better hierarchy, simpler navigation, and stronger presentation.",
    content: createArticleHtml("Editorial Landing Page Sprint", [
      {
        heading: "What is included",
        body: [
          "A revised page structure, new visual direction, component cleanup, and responsive refinements for the main public surface.",
          "The output is intended for teams that already have content but need the presentation tightened up fast.",
        ],
      },
    ]),
    priceCents: 180000,
    currency: "EUR",
    kind: "SERVICE",
    availability: "AVAILABLE",
    requiresBrief: true,
    briefPrompt:
      "Tell me what page you want redesigned, what feels wrong right now, and what outcome you want from the new direction.",
    deliveryText: "Initial design direction within three working days.",
    highlights: [
      "Visual direction",
      "Component cleanup",
      "Responsive pass",
    ],
    images: [
      remoteImages.codingSetup,
      remoteImages.planningWall,
    ],
  },
  {
    title: "Portfolio Content Pack",
    slug: "demo-portfolio-content-pack",
    summary:
      "A reusable copy and layout pack for project pages, case studies, and landing-page sections that need a clearer narrative arc.",
    content: createArticleHtml("Portfolio Content Pack", [
      {
        heading: "Built for teams with existing work",
        body: [
          "This pack helps teams present projects consistently without rewriting the whole site architecture. It is ideal for agencies, freelancers, and small product studios.",
        ],
      },
    ]),
    priceCents: 4800,
    currency: "EUR",
    kind: "DIGITAL",
    availability: "AVAILABLE",
    requiresBrief: false,
    briefPrompt: null,
    deliveryText: "Delivered immediately after checkout.",
    highlights: ["Case-study outline", "Copy prompts", "Section templates"],
    images: [
      remoteImages.materialSamples,
      remoteImages.minimalInterior,
    ],
  },
  {
    title: "UI Audit Session",
    slug: "demo-ui-audit-session",
    summary:
      "A recorded review of an existing frontend with actionable notes on hierarchy, navigation, content flow, and implementation cleanup.",
    content: createArticleHtml("UI Audit Session", [
      {
        heading: "What you receive",
        body: [
          "A written audit, a prioritised list of issues, and a practical set of recommendations that can be implemented incrementally.",
        ],
      },
    ]),
    priceCents: 95000,
    currency: "EUR",
    kind: "SERVICE",
    availability: "COMING_SOON",
    requiresBrief: true,
    briefPrompt:
      "Share the URL, the core problem, and which surfaces need review first.",
    deliveryText: "Booking opens again next month.",
    highlights: ["Recorded review", "Priority list", "Implementation notes"],
    images: [
      remoteImages.codeCloseup,
      remoteImages.teamLaptops,
    ],
  },
];

const messageSeeds: MessageSeed[] = [
  {
    name: "Maya Chen",
    email: "maya.chen@example.com",
    company: "Northline Studio",
    website: "https://northline.example.com",
    services: ["Brand frontend", "Editorial design"],
    budget: "€5k - €10k",
    timeline: "Within 1 month",
    message:
      "We have a homepage and writing archive that feel too product-like. I want a calmer dark presentation with better hierarchy and tighter navigation.",
    status: "NEW",
  },
  {
    name: "Rafael Stein",
    email: "rafael.stein@example.com",
    company: "Bfolio",
    website: "https://bfolio.example.com",
    services: ["Portfolio redesign"],
    budget: "€10k - €20k",
    timeline: "Flexible",
    message:
      "We need a project system that can support both visual case studies and shorter launch notes without forcing one rigid template across everything.",
    status: "READ",
  },
  {
    name: "Sara Haddad",
    email: "sara.haddad@example.com",
    company: "Outline Labs",
    website: "",
    services: ["Commerce UI", "Product positioning"],
    budget: "€2k - €5k",
    timeline: "ASAP",
    message:
      "Our current shop pages read like blog posts. I want the pricing and purchase intent to be clearer while still feeling premium and restrained.",
    status: "ARCHIVED",
  },
];

async function main() {
  const prisma = createPrismaClient();

  try {
    const existingAuthor =
      (await prisma.user.findFirst({
        where: { active: true },
        orderBy: [{ role: "asc" }, { id: "asc" }],
      })) ??
      (await prisma.user.create({
        data: {
          email: "demo-author@next-cms.local",
          name: "Demo Author",
          passwordHash: null,
          role: "EDITOR",
          active: true,
        },
      }));

    await prisma.appSettings.upsert({
      where: { id: 1 },
      update: {
        blogEnabled: true,
        projectsEnabled: true,
        shopEnabled: true,
      },
      create: {
        id: 1,
        blogEnabled: true,
        projectsEnabled: true,
        shopEnabled: true,
      },
    });

    await prisma.analyticsSettings.upsert({
      where: { id: 1 },
      update: { enabled: true },
      create: { id: 1, enabled: true },
    });

    for (const post of postSeeds) {
      await prisma.post.upsert({
        where: { slug: post.slug },
        update: {
          title: post.title,
          content: post.content,
          featuredImage: post.featuredImage,
          published: true,
          authorId: existingAuthor.id,
        },
        create: {
          title: post.title,
          slug: post.slug,
          content: post.content,
          featuredImage: post.featuredImage,
          published: true,
          authorId: existingAuthor.id,
        },
      });
    }

    for (const project of projectSeeds) {
      const existing = await prisma.project.findFirst({
        where: { title: project.title },
        select: { id: true },
      });

      if (existing) {
        await prisma.project.update({
          where: { id: existing.id },
          data: {
            description: project.description,
            tags: toJsonArray(project.tags),
            images: toJsonArray(project.images),
            link: project.link,
          },
        });
      } else {
        await prisma.project.create({
          data: {
            title: project.title,
            description: project.description,
            tags: toJsonArray(project.tags),
            images: toJsonArray(project.images),
            link: project.link,
          },
        });
      }
    }

    const seededProducts: Array<{ id: number; slug: string; priceCents: number; currency: string }> = [];

    for (const product of productSeeds) {
      const record = await prisma.shopProduct.upsert({
        where: { slug: product.slug },
        update: {
          title: product.title,
          summary: product.summary,
          content: product.content,
          priceCents: product.priceCents,
          currency: product.currency,
          kind: product.kind,
          active: true,
          availability: product.availability,
          requiresBrief: product.requiresBrief,
          briefPrompt: product.briefPrompt,
          deliveryText: product.deliveryText,
          highlights: toJsonArray(product.highlights),
          images: toJsonArray(product.images),
        },
        create: {
          title: product.title,
          slug: product.slug,
          summary: product.summary,
          content: product.content,
          priceCents: product.priceCents,
          currency: product.currency,
          kind: product.kind,
          active: true,
          availability: product.availability,
          requiresBrief: product.requiresBrief,
          briefPrompt: product.briefPrompt,
          deliveryText: product.deliveryText,
          highlights: toJsonArray(product.highlights),
          images: toJsonArray(product.images),
        },
      });

      seededProducts.push({
        id: record.id,
        slug: record.slug,
        priceCents: record.priceCents,
        currency: record.currency,
      });
    }

    const productBySlug = new Map(
      seededProducts.map((product) => [product.slug, product]),
    );

    const orderSeeds = [
      {
        paypalOrderId: "DUMMY-ORDER-EDITORIAL-SPRINT-001",
        paypalCaptureId: "DUMMY-CAPTURE-EDITORIAL-SPRINT-001",
        productSlug: "demo-editorial-landing-page-sprint",
        status: "COMPLETED" as const,
        buyerEmail: "client.one@example.com",
        buyerName: "Client One",
        buyerBrief:
          "We want the homepage to feel more editorial, reduce the header weight, and improve the reading rhythm on the blog.",
      },
      {
        paypalOrderId: "DUMMY-ORDER-PORTFOLIO-PACK-001",
        paypalCaptureId: null,
        productSlug: "demo-portfolio-content-pack",
        status: "PENDING" as const,
        buyerEmail: "client.two@example.com",
        buyerName: "Client Two",
        buyerBrief: "Need a clean case-study structure for six recent projects.",
      },
      {
        paypalOrderId: "DUMMY-ORDER-UI-AUDIT-001",
        paypalCaptureId: null,
        productSlug: "demo-ui-audit-session",
        status: "CANCELED" as const,
        buyerEmail: "client.three@example.com",
        buyerName: "Client Three",
        buyerBrief:
          "Wanted a product and content audit, but paused the initiative for now.",
      },
    ];

    for (const order of orderSeeds) {
      const product = productBySlug.get(order.productSlug);
      if (!product) continue;

      await prisma.shopOrder.upsert({
        where: { paypalOrderId: order.paypalOrderId },
        update: {
          productId: product.id,
          status: order.status,
          paypalCaptureId: order.paypalCaptureId,
          amountCents: product.priceCents,
          currency: product.currency,
          buyerEmail: order.buyerEmail,
          buyerName: order.buyerName,
          buyerBrief: order.buyerBrief,
        },
        create: {
          productId: product.id,
          status: order.status,
          paypalOrderId: order.paypalOrderId,
          paypalCaptureId: order.paypalCaptureId,
          amountCents: product.priceCents,
          currency: product.currency,
          buyerEmail: order.buyerEmail,
          buyerName: order.buyerName,
          buyerBrief: order.buyerBrief,
        },
      });
    }

    for (const message of messageSeeds) {
      const existing = await prisma.contactMessage.findFirst({
        where: {
          email: message.email,
          name: message.name,
          message: message.message,
        },
        select: { id: true },
      });

      if (existing) {
        await prisma.contactMessage.update({
          where: { id: existing.id },
          data: {
            company: message.company,
            website: message.website || null,
            services: toJsonArray(message.services),
            budget: message.budget,
            timeline: message.timeline,
            status: message.status,
            readAt: message.status === "READ" ? new Date() : null,
          },
        });
      } else {
        await prisma.contactMessage.create({
          data: {
            name: message.name,
            email: message.email,
            company: message.company,
            website: message.website || null,
            services: toJsonArray(message.services),
            budget: message.budget,
            timeline: message.timeline,
            message: message.message,
            status: message.status,
            readAt: message.status === "READ" ? new Date() : null,
          },
        });
      }
    }

    const analyticsCount = await prisma.analyticsPageView.count();

    if (analyticsCount === 0) {
      const now = Date.now();
      await prisma.analyticsPageView.createMany({
        data: [
          {
            path: "/",
            postSlug: null,
            visitorToken: "dummy-visitor-01",
            createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2),
          },
          {
            path: "/",
            postSlug: null,
            visitorToken: "dummy-visitor-02",
            createdAt: new Date(now - 1000 * 60 * 60 * 24),
          },
          {
            path: "/posts/demo-dark-first-editorial-frontend",
            postSlug: "demo-dark-first-editorial-frontend",
            visitorToken: "dummy-visitor-01",
            createdAt: new Date(now - 1000 * 60 * 60 * 20),
          },
          {
            path: "/posts/demo-separate-work-writing-commerce",
            postSlug: "demo-separate-work-writing-commerce",
            visitorToken: "dummy-visitor-03",
            createdAt: new Date(now - 1000 * 60 * 60 * 14),
          },
          {
            path: "/work",
            postSlug: null,
            visitorToken: "dummy-visitor-04",
            createdAt: new Date(now - 1000 * 60 * 60 * 8),
          },
          {
            path: "/shop/demo-editorial-landing-page-sprint",
            postSlug: null,
            visitorToken: "dummy-visitor-05",
            createdAt: new Date(now - 1000 * 60 * 60 * 4),
          },
        ],
      });
    }

    const [users, posts, projects, products, orders, messages, pageViews] =
      await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.project.count(),
        prisma.shopProduct.count(),
        prisma.shopOrder.count(),
        prisma.contactMessage.count(),
        prisma.analyticsPageView.count(),
      ]);

    console.log(
      JSON.stringify(
        {
          seededBy: "scripts/seed-dummy-data.ts",
          author: {
            id: existingAuthor.id,
            email: existingAuthor.email,
            name: existingAuthor.name,
          },
          counts: {
            users,
            posts,
            projects,
            products,
            orders,
            messages,
            pageViews,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
