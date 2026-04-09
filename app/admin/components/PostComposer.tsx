"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, type ChangeEvent, type FormEventHandler } from "react";

import { shouldBypassImageOptimization } from "@/lib/image";
import {
  adminInputClass,
  adminKickerClass,
  adminPanelMutedClass,
  adminTextareaClass,
} from "./ui";
import type { PostFormState } from "./types";

const PostContentEditor = dynamic(() => import("../PostContentEditor"), {
  ssr: false,
  loading: () => (
    <div className={`${adminPanelMutedClass} mt-4 min-h-[18rem] px-5 py-5`}>
      <p className={adminKickerClass}>Loading editor</p>
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
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onSeoImageChange: (value: string) => void;
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
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoImageChange,
  onPublishedToggle,
  onFeaturedImageChange,
  onRemoveFeaturedImage,
  onContentChange,
}: PostComposerProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const wordCount = postForm.contentText.trim()
    ? postForm.contentText.trim().split(/\s+/).length
    : 0;

  return (
    <form onSubmit={onSubmit} className="min-h-screen">
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
            onClick={() => setIsSettingsOpen((open) => !open)}
            className={`inline-flex min-h-9 items-center justify-center rounded-md border px-3 text-[0.82rem] font-medium transition ${isSettingsOpen
              ? "border-white/16 bg-white/[0.08] text-white"
              : "border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.06] hover:text-white"
              }`}
            aria-expanded={isSettingsOpen}
            aria-controls="post-seo-settings"
          >
            <span className="sr-only">
              {isSettingsOpen ? "Close post settings" : "Open post settings"}
            </span>
            <Icon path="M4 6H20M4 12H20M4 18H20" className="h-4 w-4" />
          </button>
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

      {isSettingsOpen ? (
        <button
          type="button"
          aria-label="Close settings panel"
          onClick={() => setIsSettingsOpen(false)}
          className="fixed inset-0 z-20 bg-black/35 backdrop-blur-[1px] xl:hidden"
        />
      ) : null}

      <div
        className={`px-4 py-8 transition-[padding] duration-300 md:px-8 md:py-10 ${isSettingsOpen ? "xl:pr-[26rem]" : ""
          }`}
      >
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
              className="w-full border-0 bg-transparent px-0 py-0 text-[clamp(3rem,7vw,4.7rem)]! leading-[0.9] font-semibold tracking-[-0.058em] text-white outline-none placeholder:text-white/10"
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

      <aside
        id="post-seo-settings"
        className={`fixed top-14 right-0 bottom-0 z-30 w-full max-w-[24rem] overflow-y-auto border-l border-white/6 bg-[#17191c]/96 shadow-[-24px_0_48px_rgba(0,0,0,0.22)] backdrop-blur transition-transform duration-300 ${isSettingsOpen ? "translate-x-0" : "translate-x-full"
          }`}
        aria-hidden={!isSettingsOpen}
      >
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/6 px-5">
          <div>
            <p className="text-[0.98rem] font-semibold text-white">Post settings</p>
            <p className="mt-1 text-xs text-white/34">Search and social preview</p>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/8 bg-white/[0.03] text-white/56 transition hover:border-white/12 hover:bg-white/[0.06] hover:text-white"
          >
            <span className="sr-only">Close post settings</span>
            <Icon path="M6 6L18 18M18 6L6 18" className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className={`${adminPanelMutedClass} p-5`}>
            <p className={adminKickerClass}>SEO</p>
            <p className="mt-2 text-sm leading-relaxed text-white/42">
              Override the default title, description, and preview image for search engines and link cards.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className={adminKickerClass}>SEO title</span>
                <input
                  type="text"
                  value={postForm.seoTitle}
                  onChange={(event) => onSeoTitleChange(event.target.value)}
                  className={`${adminInputClass} mt-3`}
                  placeholder="Defaults to the post title"
                  maxLength={191}
                />
              </label>

              <label className="block">
                <span className={adminKickerClass}>SEO description</span>
                <textarea
                  value={postForm.seoDescription}
                  onChange={(event) => onSeoDescriptionChange(event.target.value)}
                  className={`${adminTextareaClass} mt-3 min-h-28`}
                  placeholder="Defaults to the article excerpt"
                  maxLength={320}
                />
              </label>

              <label className="block">
                <span className={adminKickerClass}>SEO image URL</span>
                <input
                  type="text"
                  value={postForm.seoImage}
                  onChange={(event) => onSeoImageChange(event.target.value)}
                  className={`${adminInputClass} mt-3`}
                  placeholder="Defaults to the featured image"
                />
              </label>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={`pointer-events-none fixed bottom-4 flex items-center gap-2 text-[0.76rem] text-white/28 transition-[right] duration-300 right-4 md:bottom-5 ${isSettingsOpen ? "md:right-[25.5rem]" : "md:right-6"
          }`}
      >
        <span>{wordCount} words</span>
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/10 text-[0.62rem]">
          ?
        </span>
      </div>
    </form>
  );
}
