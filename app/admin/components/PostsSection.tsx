"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getExcerptFromHtml } from "@/lib/post-content";

import { StatusPill, adminTableHeadClass } from "./ui";
import type { AdminPost } from "./types";

type PostsSectionProps = {
  posts: AdminPost[];
  postViewCounts: Record<string, number>;
  isDeletingPostId: number | null;
  onEdit: (post: AdminPost) => void;
  onDelete: (post: AdminPost) => void;
};

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

function PostActionMenu({
  post,
  deleting,
  open,
  onOpen,
  onClose,
  onEdit,
  onDelete,
}: {
  post: AdminPost;
  deleting: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div data-post-menu-root className="relative flex justify-end">
      <button
        type="button"
        onClick={() => (open ? onClose() : onOpen())}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-transparent text-[var(--admin-faint)] transition hover:border-[var(--admin-border)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-text)]"
        aria-expanded={open}
        aria-label={`Open actions for ${post.title}`}
      >
        <MenuIcon />
      </button>

      {open ? (
        <div className="absolute top-11 right-0 z-20 w-40 overflow-hidden rounded-[0.7rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1 shadow-[0_18px_42px_rgba(0,0,0,0.24)]">
          {post.published ? (
            <Link
              href={`/posts/${post.slug}`}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="flex min-h-9 items-center rounded-[0.55rem] px-3 text-[0.84rem] font-medium text-[var(--admin-text)] transition hover:bg-[var(--admin-surface-2)]"
            >
              Preview
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit();
            }}
            className="flex min-h-9 w-full items-center rounded-[0.55rem] px-3 text-left text-[0.84rem] font-medium text-[var(--admin-text)] transition hover:bg-[var(--admin-surface-2)]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete();
            }}
            disabled={deleting}
            className="flex min-h-9 w-full items-center rounded-[0.55rem] px-3 text-left text-[0.84rem] font-medium text-[#ff9b9b] transition hover:bg-[rgba(255,106,106,0.08)] disabled:opacity-45"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function PostsSection({
  posts,
  postViewCounts,
  isDeletingPostId,
  onEdit,
  onDelete,
}: PostsSectionProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (openMenuId === null) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;

      if (
        target instanceof Element &&
        target.closest("[data-post-menu-root]")
      ) {
        return;
      }

      setOpenMenuId(null);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenuId]);

  return (
    <section className="admin-panel overflow-hidden bg-[var(--admin-surface)]">
      <div className="overflow-x-auto">
        <div className="min-w-[58rem]">
          <div className="grid grid-cols-[minmax(0,1.9fr)_4.5rem_11rem_8rem_3rem] gap-4 px-6 py-4 md:px-8">
            <span className={adminTableHeadClass}>Title</span>
            <span className={`${adminTableHeadClass} text-right`}>Views</span>
            <span className={adminTableHeadClass}>Path</span>
            <span className={`${adminTableHeadClass} text-center`}>Status</span>
            <span className={`${adminTableHeadClass} text-right`}>More</span>
          </div>

          {posts.length === 0 ? (
            <div className="border-t border-white/[0.04] px-6 py-10 text-sm text-[var(--admin-faint)] md:px-8">
              No posts yet.
            </div>
          ) : (
            <div className="border-t border-white/[0.04]">
              {posts.map((post) => {
                const excerpt = getExcerptFromHtml(post.content, 110);

                return (
                  <div
                    key={post.id}
                    className="grid grid-cols-[minmax(0,1.9fr)_4.5rem_11rem_8rem_3rem] gap-4 px-6 py-4 transition hover:bg-white/[0.018] md:px-8"
                  >
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onEdit(post)}
                        className="max-w-full truncate text-left text-[1rem] font-semibold tracking-[-0.02em] text-[var(--admin-text)] transition hover:text-white"
                      >
                        {post.title}
                      </button>
                      <p className="mt-1 line-clamp-1 text-[0.91rem] leading-relaxed text-[var(--admin-faint)]">
                        {excerpt || "No content yet."}
                      </p>
                    </div>

                    <div className="pt-1 text-right text-[0.88rem] text-[var(--admin-muted)]">
                      {postViewCounts[post.slug] ?? 0}
                    </div>

                    <div className="truncate pt-1 text-[0.88rem] text-[var(--admin-faint)]">
                      /posts/{post.slug}
                    </div>

                    <div className="flex justify-center pt-0.5">
                      <StatusPill published={post.published} />
                    </div>

                    <PostActionMenu
                      post={post}
                      deleting={isDeletingPostId === post.id}
                      open={openMenuId === post.id}
                      onOpen={() => setOpenMenuId(post.id)}
                      onClose={() => setOpenMenuId(null)}
                      onEdit={() => onEdit(post)}
                      onDelete={() => onDelete(post)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
