"use client";

import Link from "next/link";

import { getExcerptFromHtml } from "@/lib/post-content";

import { StatusPill } from "./ui";
import type { AdminPost } from "./types";

type PostsSectionProps = {
  posts: AdminPost[];
  postViewCounts: Record<string, number>;
  isDeletingPostId: number | null;
  onEdit: (post: AdminPost) => void;
  onDelete: (post: AdminPost) => void;
};

export default function PostsSection({
  posts,
  postViewCounts,
  isDeletingPostId,
  onEdit,
  onDelete,
}: PostsSectionProps) {
  return (
    <section className="admin-panel overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[56rem]">
          <div className="grid grid-cols-[minmax(0,1.8fr)_7rem_9rem_7rem_8rem] gap-4 border-b border-white/6 px-6 py-4 md:px-8">
        <span className="admin-table-head">Title</span>
        <span className="admin-table-head text-right">Views</span>
        <span className="admin-table-head">Path</span>
        <span className="admin-table-head text-center">Status</span>
        <span className="admin-table-head text-right">Actions</span>
          </div>

          {posts.length === 0 ? (
            <div className="px-6 py-8 text-sm text-white/46 md:px-8">No posts yet.</div>
          ) : (
            posts.map((post) => {
              const excerpt = getExcerptFromHtml(post.content, 105);

              return (
                <div
                  key={post.id}
                  className="grid grid-cols-[minmax(0,1.8fr)_7rem_9rem_7rem_8rem] gap-4 border-b border-white/6 px-6 py-5 last:border-b-0 md:px-8"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[1rem] font-semibold text-white/94">
                      {post.title}
                    </p>
                    <p className="mt-2 line-clamp-2 max-w-3xl text-[0.92rem] leading-relaxed text-white/42">
                      {excerpt || "No content yet."}
                    </p>
                  </div>

                  <div className="text-right text-sm text-white/54">
                    {postViewCounts[post.slug] ?? 0}
                  </div>

                  <div className="truncate text-sm text-white/42">/posts/{post.slug}</div>

                  <div className="flex justify-center">
                    <StatusPill published={post.published} />
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    {post.published ? (
                      <Link
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-white/58 transition hover:text-white"
                      >
                        Preview
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onEdit(post)}
                      className="text-sm text-white/68 transition hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(post)}
                      disabled={isDeletingPostId === post.id}
                      className="text-sm text-[#ff8f8f] transition hover:text-[#ffb1b1] disabled:opacity-45"
                    >
                      {isDeletingPostId === post.id ? "Deleting" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
