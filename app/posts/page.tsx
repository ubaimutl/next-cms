import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "../components/layout/Footer";

import { getExcerptFromHtml, getReadingTimeMinutes } from "@/lib/post-content";
import { getPosts } from "@/lib/posts";
import { getPublicModuleSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

type PostListItem = {
  id: number;
  title: string;
  slug: string;
  content: string | null;
};

export const metadata: Metadata = {
  title: "Blog",
  description: `Articles, notes, and updates published on ${siteConfig.name}.`,
  alternates: {
    canonical: "/posts",
  },
};

export const dynamic = "force-dynamic";

export default async function ThoughtsPage() {
  const settings = await getPublicModuleSettings();

  if (!settings.blogEnabled) {
    notFound();
  }

  const posts = await getPosts();

  return (
    <>
      <section className="shell-narrow">
        <div className="front-page-header front-rule">
          <p className="front-kicker">Writings</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.4rem,5vw,4rem)] leading-[0.96] font-medium tracking-[-0.05em]">
            Writing archive.
          </h1>
          <p className="front-copy mt-5 max-w-2xl">
            Shorter summaries, tighter spacing, and a narrower reading column
            so the archive feels editorial rather than app-like.
          </p>
        </div>
      </section>

      <section className="shell-narrow">
        {posts.length > 0 ? (
          <div className="front-list">
            {posts.map((post: PostListItem) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="front-list-item block transition hover:opacity-80"
              >
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_7rem] md:items-start">
                  <div className="max-w-2xl">
                    <h2 className="text-[clamp(1.55rem,3vw,2.2rem)] leading-[1] font-medium tracking-[-0.045em]">
                      {post.title}
                    </h2>
                    <p className="front-meta mt-3">
                      {getExcerptFromHtml(post.content, 190) ||
                        "Published with semantic structure and a cleaner reading layout."}
                    </p>
                  </div>
                  <div className="front-meta md:pt-1 md:text-right">
                    {getReadingTimeMinutes(post.content)} min read
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="front-card p-6 md:p-8">
            <p className="front-kicker">No posts published</p>
            <p className="front-copy mt-4">
              Publish the first post in admin and it will appear here.
            </p>
          </div>
        )}
      </section>

      <section className="shell-narrow mt-8">
        <div className="front-rule pt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/contact" className="front-button">
              Contact
            </Link>
            <Link href="/admin" className="front-button-subtle">
              Open admin
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
