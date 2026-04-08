import type { Metadata } from "next";
import Link from "next/link";

import Footer from "./components/layout/Footer";

import {
  normalizeProjectRecord,
  normalizeShopProductRecord,
} from "@/lib/db-json";
import {
  getExcerptFromHtml,
  getReadingTimeMinutes,
} from "@/lib/post-content";
import { getPosts } from "@/lib/posts";
import prisma from "@/lib/prisma";
import { getPublicModuleSettings } from "@/lib/settings";
import { formatPrice, getProductKindLabel } from "@/lib/shop";
import { siteConfig } from "@/lib/site";

type ProjectPreview = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  images: string[];
  link: string | null;
};

type ProductPreview = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  priceCents: number;
  currency: string;
  kind: "SERVICE" | "DIGITAL";
  images: string[];
};

type PostPreview = {
  id: number;
  title: string;
  slug: string;
  content: string | null;
};

type SpotlightCard = {
  title: string;
  href: string;
  meta: string;
  excerpt: string;
  cta: string;
};

export const metadata: Metadata = {
  title: "Home",
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
};

export const dynamic = "force-dynamic";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  email: siteConfig.email,
};

function buildSpotlightCards(
  posts: PostPreview[],
  projects: ProjectPreview[],
  products: ProductPreview[],
): SpotlightCard[] {
  const postCards = posts.slice(0, 4).map((post) => ({
    title: post.title,
    href: `/posts/${post.slug}`,
    meta: `${getReadingTimeMinutes(post.content)} min read`,
    excerpt:
      getExcerptFromHtml(post.content, 110) ||
      "Published from the built-in editor with a cleaner reading layout.",
    cta: "Read more",
  }));

  if (postCards.length >= 4) {
    return postCards;
  }

  const projectCards = projects.slice(0, 2).map((project) => ({
    title: project.title,
    href: project.link || "/work",
    meta: "Project",
    excerpt: project.description,
    cta: project.link ? "Open project" : "View work",
  }));

  const productCards = products.slice(0, 2).map((product) => ({
    title: product.title,
    href: `/shop/${product.slug}`,
    meta: `${getProductKindLabel(product.kind)} · ${formatPrice(product.priceCents, product.currency)}`,
    excerpt: product.summary,
    cta: "Read more",
  }));

  return [...postCards, ...projectCards, ...productCards].slice(0, 4);
}

export default async function Home() {
  const settings = await getPublicModuleSettings();
  const [projects, posts, products] = await Promise.all([
    settings.projectsEnabled
      ? prisma.project.findMany({
          orderBy: { id: "desc" },
          take: 4,
        })
      : Promise.resolve([]),
    settings.blogEnabled ? getPosts() : Promise.resolve([]),
    settings.shopEnabled
      ? prisma.shopProduct.findMany({
          where: { active: true },
          orderBy: { id: "desc" },
          take: 4,
        })
      : Promise.resolve([]),
  ]);

  const projectItems = projects.map(normalizeProjectRecord) as ProjectPreview[];
  const postItems = (posts as PostPreview[]).slice(0, 6);
  const productItems: ProductPreview[] = products.map((product) => {
    const normalized = normalizeShopProductRecord(product);

    return {
      id: normalized.id,
      title: normalized.title,
      slug: normalized.slug,
      summary: normalized.summary,
      priceCents: normalized.priceCents,
      currency: normalized.currency,
      kind: normalized.kind,
      images: normalized.images,
    };
  });

  const spotlightCards = buildSpotlightCards(
    postItems,
    projectItems,
    productItems,
  );

  const latestCards = postItems.slice(0, 4);
  const topicTags = Array.from(
    new Set(
      [
        ...(settings.blogEnabled ? ["Writing"] : []),
        ...(settings.projectsEnabled ? ["Projects"] : []),
        ...(settings.shopEnabled ? ["Shop"] : []),
        ...projectItems.flatMap((project) => project.tags),
      ].filter(Boolean),
    ),
  ).slice(0, 8);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <section className="shell">
        <div className="front-rule py-[clamp(3rem,7vw,6rem)]">
          <div className="mx-auto max-w-[40rem] text-center">
            <p className="front-kicker">{siteConfig.shortName}</p>
            <h1 className="mt-4 text-[clamp(2.7rem,6vw,4.75rem)] leading-[0.94] font-medium tracking-[-0.055em]">
              Publishing, portfolio, and commerce in one quieter frontend.
            </h1>
            <p className="mt-5 max-w-[42rem] text-[1.03rem] leading-[1.72] text-base-content/72">
              A calmer public surface for writing, projects, and lightweight
              offers. Less dashboard energy, more focus on content.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/posts" className="front-button">
                Read the blog
              </Link>
              <Link href="/contact" className="front-button-subtle">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="shell mt-2">
        {spotlightCards.length > 0 ? (
          <div className="front-floating-row">
            {spotlightCards.map((card, index) => {
              const tilts = ["left", "mid-left", "mid-right", "right"] as const;

              return (
                <Link
                  key={`${card.href}-${card.title}`}
                  href={card.href}
                  data-tilt={tilts[index] ?? "right"}
                  className="front-floating-card block transition hover:opacity-90"
                >
                  <h2 className="text-[1.45rem] leading-[1.02] font-medium tracking-[-0.045em]">
                    {card.title}
                  </h2>
                  <p className="mt-3 text-[0.9rem] leading-[1.6] text-base-content/62">
                    {card.meta}
                  </p>
                  <p className="mt-4 text-[0.9rem] leading-[1.6] text-base-content/62">
                    {card.excerpt}
                  </p>
                  <span className="front-button-subtle mt-5 min-h-9 px-4 text-sm">
                    {card.cta}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </section>

      {topicTags.length > 0 ? (
        <section className="shell mt-12">
          <div className="mx-auto max-w-[40rem] text-center">
            <p className="front-kicker">Tags</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {topicTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-[var(--line-soft)] bg-transparent px-[0.8rem] py-[0.35rem] text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-base-content/66"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="shell mt-14">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <p className="front-kicker">Latest</p>
            <Link href="/posts" className="front-link">
              All posts
            </Link>
          </div>

          {latestCards.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {latestCards.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="front-card block p-5 transition hover:opacity-90"
                >
                  <h2 className="text-[1.7rem] leading-[1.02] font-medium tracking-[-0.045em]">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-[0.9rem] leading-[1.6] text-base-content/62">
                    {getExcerptFromHtml(post.content, 140) ||
                      "Published from the built-in editor with a cleaner reading layout."}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <span className="text-[0.9rem] leading-[1.6] text-base-content/62">
                      {getReadingTimeMinutes(post.content)} min read
                    </span>
                    <span className="front-button-subtle min-h-9 px-4 text-sm">
                      Read more
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="front-card mt-5 p-6">
              <p className="text-[0.9rem] leading-[1.6] text-base-content/62">
                Publish the first post in admin and the homepage feed will
                populate here automatically.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="shell mt-14">
        <div className="mx-auto max-w-5xl front-rule pt-8">
          <div className="grid gap-4 md:grid-cols-3">
            {settings.projectsEnabled ? (
              <Link href="/work" className="front-card block p-5 transition hover:opacity-90">
                <p className="front-kicker">Work</p>
                <p className="mt-3 text-[1.35rem] leading-tight font-medium tracking-[-0.035em]">
                  Selected projects and visual case studies.
                </p>
              </Link>
            ) : null}

            {settings.blogEnabled ? (
              <Link href="/posts" className="front-card block p-5 transition hover:opacity-90">
                <p className="front-kicker">Blog</p>
                <p className="mt-3 text-[1.35rem] leading-tight font-medium tracking-[-0.035em]">
                  Notes, articles, and longer pieces.
                </p>
              </Link>
            ) : null}

            {settings.shopEnabled ? (
              <Link href="/shop" className="front-card block p-5 transition hover:opacity-90">
                <p className="front-kicker">Shop</p>
                <p className="mt-3 text-[1.35rem] leading-tight font-medium tracking-[-0.035em]">
                  Digital products and service offers.
                </p>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
