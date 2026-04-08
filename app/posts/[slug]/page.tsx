import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/app/components/layout/Footer";
import {
  shouldBypassImageOptimization,
  toAbsoluteImageUrl,
} from "@/lib/image";
import {
  addHeadingIdsToHtml,
  extractHeadingsFromHtml,
  getExcerptFromHtml,
  getReadingTimeMinutes,
  getWordCountFromHtml,
} from "@/lib/post-content";
import { getPostBySlug } from "@/lib/posts";
import { getPublicModuleSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

import PostDetailRail from "./PostDetailRail";

interface PostProps {
  params: Promise<{ slug: string }>;
}

function RailIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="front-icon-button h-12 w-12">
      {children}
    </span>
  );
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PostProps): Promise<Metadata> {
  const { slug } = await params;
  const settings = await getPublicModuleSettings();

  if (!settings.blogEnabled) {
    return {
      title: "Post not found",
      robots: { index: false, follow: false },
    };
  }

  const post = await getPostBySlug(slug);

  if (!post || !post.published) {
    return {
      title: "Post not found",
      robots: { index: false, follow: false },
    };
  }

  const description =
    getExcerptFromHtml(post.content, 160) || siteConfig.description;
  const canonicalPath = `/posts/${post.slug}`;
  const shareImage =
    toAbsoluteImageUrl(post.featuredImage, siteConfig.url) || siteConfig.ogImage;

  return {
    title: post.title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      url: canonicalPath,
      title: post.title,
      description,
      siteName: siteConfig.shortName,
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `${post.title} article preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [shareImage],
    },
  };
}

const PostSingle = async ({ params }: PostProps) => {
  const { slug } = await params;
  const settings = await getPublicModuleSettings();

  if (!settings.blogEnabled) {
    notFound();
  }

  const post = await getPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  const description =
    getExcerptFromHtml(post.content, 160) || siteConfig.description;
  const headings = extractHeadingsFromHtml(post.content);
  const contentWithHeadingIds = addHeadingIdsToHtml(post.content);
  const readingTime = getReadingTimeMinutes(post.content);
  const wordCount = getWordCountFromHtml(post.content);
  const postUrl = `${siteConfig.url}/posts/${post.slug}`;
  const shareLinks = {
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`,
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`${post.title}\n\n${postUrl}`)}`,
  };
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    url: postUrl,
    mainEntityOfPage: postUrl,
    author: { "@type": "Person", name: siteConfig.name },
    publisher: { "@type": "Person", name: siteConfig.name },
    image: [toAbsoluteImageUrl(post.featuredImage, siteConfig.url) || siteConfig.ogImage],
  };

  return (
    <>
      <section className="shell-narrow">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />

        <div className="front-rule py-[clamp(3rem,6vw,5.5rem)]">
          <p className="front-kicker">Writing</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.4rem,5vw,4rem)] leading-[0.96] font-medium tracking-[-0.05em]">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[0.9rem] leading-[1.6] text-base-content/62">
              Article
            </span>
            <span className="text-[0.9rem] leading-[1.6] text-base-content/62">
              {readingTime} min read
            </span>
            <span className="text-[0.9rem] leading-[1.6] text-base-content/62">
              {wordCount} words
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-[1.03rem] leading-[1.72] text-base-content/72">
            {description}
          </p>
        </div>
      </section>

      <div className="front-action-rail" aria-label="Article actions">
        <Link href="/posts" aria-label="Back to posts">
          <RailIcon>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18L9 12L15 6" />
            </svg>
          </RailIcon>
        </Link>
        <a href={shareLinks.x} target="_blank" rel="noreferrer" aria-label="Share on X">
          <RailIcon>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 7L17 17" />
              <path d="M17 7L7 17" />
            </svg>
          </RailIcon>
        </a>
        <a href={shareLinks.email} aria-label="Share by email">
          <RailIcon>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7H20V17H4z" />
              <path d="M4 8L12 13L20 8" />
            </svg>
          </RailIcon>
        </a>
      </div>

      <section className="shell-narrow">
        {post.featuredImage ? (
          <div className="media-frame aspect-[16/9]">
            <Image
              src={post.featuredImage}
              alt={`${post.title} featured image`}
              fill
              priority
              unoptimized={shouldBypassImageOptimization(post.featuredImage)}
              sizes="(max-width: 768px) 100vw, 50rem"
              className="object-cover"
            />
          </div>
        ) : null}
      </section>

      <section className="shell-narrow mt-8">
        <article
          className="post-content text-[1.02rem] leading-[1.85]"
          dangerouslySetInnerHTML={{ __html: contentWithHeadingIds }}
        />

        <div className="front-rule mt-10 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={shareLinks.x}
              target="_blank"
              rel="noreferrer"
              className="front-button-subtle"
            >
              Share on X
            </a>
            <a
              href={shareLinks.linkedIn}
              target="_blank"
              rel="noreferrer"
              className="front-button-subtle"
            >
              LinkedIn
            </a>
            <Link href="/posts" className="front-button-subtle">
              All posts
            </Link>
          </div>
        </div>
      </section>

      <section className="shell-narrow mt-8">
        <PostDetailRail
          headings={headings}
          readingTime={readingTime}
          wordCount={wordCount}
          slug={post.slug}
        />
      </section>

      <Footer />
    </>
  );
};

export default PostSingle;
