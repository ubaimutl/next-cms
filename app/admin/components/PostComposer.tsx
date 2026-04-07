"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import type { ChangeEvent, FormEventHandler } from "react";

import { shouldBypassImageOptimization } from "@/lib/image";
import type { PostFormState } from "./types";

const PostContentEditor = dynamic(() => import("../PostContentEditor"), {
  ssr: false,
  loading: () => (
    <div className="admin-panel-muted mt-4 min-h-[18rem] px-5 py-5">
      <p className="admin-kicker">Loading editor</p>
    </div>
  ),
});

type PostComposerProps = {
  isEditingPost: boolean;
  postForm: PostFormState;
  editorKey: number;
  postInputKey: number;
  featuredImageUrl: string | null;
  isSubmittingPost: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  onTitleChange: (title: string) => void;
  onPublishedToggle: () => void;
  onFeaturedImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFeaturedImage: () => void;
  onContentChange: (args: { html: string; text: string }) => void;
};

function Icon({
  path,
  className = "h-4 w-4",
}: {
  path: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export default function PostComposer({
  isEditingPost,
  postForm,
  editorKey,
  postInputKey,
  featuredImageUrl,
  isSubmittingPost,
  onSubmit,
  onCancel,
  onTitleChange,
  onPublishedToggle,
  onFeaturedImageChange,
  onRemoveFeaturedImage,
  onContentChange,
}: PostComposerProps) {
  const wordCount = postForm.contentText.trim()
    ? postForm.contentText.trim().split(/\s+/).length
    : 0;

  return (
    <form onSubmit={onSubmit} className="min-h-screen bg-[#15171a]">
      <div className="flex min-h-14 items-center justify-between gap-4 border-b border-white/6 px-4 md:px-8">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 text-sm text-white/46 transition hover:text-white/72"
        >
          <Icon path="m15 18-6-6 6-6" className="h-3.5 w-3.5" />
          <span>Posts</span>
          <span className="text-white/24">{isEditingPost ? "Edit" : "New"}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPublishedToggle}
            className="inline-flex min-h-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-3 text-[0.82rem] font-medium text-white/72 transition hover:bg-white/[0.06] hover:text-white"
          >
            {postForm.published ? "Published" : "Draft"}
          </button>
          <button
            type="submit"
            disabled={isSubmittingPost}
            className="inline-flex min-h-9 items-center justify-center rounded-md bg-white px-3.5 text-[0.82rem] font-semibold text-[#111315] transition hover:opacity-90 disabled:opacity-45"
          >
            {isSubmittingPost
              ? "Saving"
              : isEditingPost
                ? "Update post"
                : postForm.published
                  ? "Publish"
                  : "Save draft"}
          </button>
        </div>
      </div>

      <div className="px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto w-full max-w-[48rem]">
          <div className="mb-8 flex flex-wrap items-center gap-4 text-sm">
            <label className="inline-flex cursor-pointer items-center gap-2 text-white/34 transition hover:text-white/62">
              <Icon path="M12 5v14M5 12h14" className="h-3.5 w-3.5" />
              <span>
                {featuredImageUrl || postForm.featuredImageFile
                  ? "Replace feature image"
                  : "Add feature image"}
              </span>
              <input
                key={postInputKey}
                type="file"
                accept="image/avif,image/jpeg,image/png,image/webp"
                onChange={onFeaturedImageChange}
                className="hidden"
              />
            </label>

            {(featuredImageUrl || postForm.featuredImageFile) ? (
              <button
                type="button"
                onClick={onRemoveFeaturedImage}
                className="text-white/28 transition hover:text-white/62"
              >
                Remove
              </button>
            ) : null}
          </div>

          {(featuredImageUrl || postForm.featuredImageFile) && (
            <div className="mb-8 overflow-hidden rounded-[0.45rem] border border-white/6 bg-black/20">
              <div className="relative aspect-[16/7] w-full">
                {featuredImageUrl ? (
                  <Image
                    src={featuredImageUrl}
                    alt="Featured image preview"
                    fill
                    unoptimized={shouldBypassImageOptimization(featuredImageUrl)}
                    sizes="(max-width: 768px) 100vw, 48rem"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm text-white/44">New image selected</span>
                  </div>
                )}
              </div>

              <div className="border-t border-white/6 px-4 py-3 text-sm text-white/44">
                {postForm.featuredImageFile?.name ?? featuredImageUrl}
              </div>
            </div>
          )}

          <label className="block">
            <input
              type="text"
              value={postForm.title}
              onChange={(event) => onTitleChange(event.target.value)}
              className="w-full border-0 bg-transparent px-0 py-0 text-[clamp(3rem,7vw,4.7rem)] leading-[0.9] font-semibold tracking-[-0.058em] text-white outline-none placeholder:text-white/10"
              placeholder="Post title"
              required
            />
          </label>

          <PostContentEditor
            editorKey={editorKey}
            initialHtml={postForm.contentHtml}
            onChange={onContentChange}
            placeholder="Begin writing your post..."
            variant="ghost"
          />
        </div>
      </div>

      <div className="pointer-events-none fixed right-4 bottom-4 flex items-center gap-2 text-[0.76rem] text-white/28 md:right-6 md:bottom-5">
        <span>{wordCount} words</span>
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/10 text-[0.62rem]">
          ?
        </span>
      </div>
    </form>
  );
}
