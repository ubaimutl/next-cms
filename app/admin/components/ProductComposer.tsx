"use client";

import dynamic from "next/dynamic";
import {
  useState,
  type ChangeEventHandler,
  type FormEventHandler,
} from "react";

import type { AdminProductAvailability, ProductFormState } from "./types";
import {
  adminFileInputClass,
  adminInputClass,
  adminKickerClass,
  adminPanelMutedClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminTextareaClass,
} from "./ui";

const PostContentEditor = dynamic(() => import("../PostContentEditor"), {
  ssr: false,
  loading: () => (
    <div className={`${adminPanelMutedClass} mt-4 min-h-[18rem] px-5 py-5`}>
      <p className={adminKickerClass}>Loading editor</p>
    </div>
  ),
});

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

type ProductComposerProps = {
  isEditingProduct: boolean;
  productForm: ProductFormState;
  productExistingImages: string[];
  productInputKey: number;
  editorKey: number;
  isSubmittingProduct: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onSeoImageChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onKindChange: (value: "SERVICE" | "DIGITAL") => void;
  onActiveToggle: () => void;
  onAvailabilityChange: (value: AdminProductAvailability) => void;
  onRequiresBriefToggle: () => void;
  onBriefPromptChange: (value: string) => void;
  onDeliveryTextChange: (value: string) => void;
  onHighlightsChange: (value: string) => void;
  onPrimaryImageChange: ChangeEventHandler<HTMLInputElement>;
  onSecondaryImageChange: ChangeEventHandler<HTMLInputElement>;
  onContentChange: (args: { html: string; text: string }) => void;
};

export default function ProductComposer({
  isEditingProduct,
  productForm,
  productExistingImages,
  productInputKey,
  editorKey,
  isSubmittingProduct,
  onSubmit,
  onCancel,
  onTitleChange,
  onSummaryChange,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoImageChange,
  onPriceChange,
  onKindChange,
  onActiveToggle,
  onAvailabilityChange,
  onRequiresBriefToggle,
  onBriefPromptChange,
  onDeliveryTextChange,
  onHighlightsChange,
  onPrimaryImageChange,
  onSecondaryImageChange,
  onContentChange,
}: ProductComposerProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <form onSubmit={onSubmit} className="admin-panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/6 px-6 py-4 md:px-8">
        <div className="flex items-center gap-3 text-sm text-white/44">
          <span>Shop</span>
          <span>/</span>
          <span>{isEditingProduct ? "Editing" : "New"}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSettingsOpen((open) => !open)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-[0.6rem] border transition ${
              isSettingsOpen
                ? "border-white/16 bg-white/[0.08] text-white"
                : "border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.06] hover:text-white"
            }`}
            aria-expanded={isSettingsOpen}
            aria-controls="product-seo-settings"
          >
            <span className="sr-only">
              {isSettingsOpen
                ? "Close product settings"
                : "Open product settings"}
            </span>
            <Icon path="M4 6H20M4 12H20M4 18H20" />
          </button>
          <button
            type="button"
            onClick={() =>
              onKindChange(
                productForm.kind === "SERVICE" ? "DIGITAL" : "SERVICE",
              )
            }
            className={adminSecondaryButtonClass}
          >
            {productForm.kind === "SERVICE" ? "Service" : "Digital"}
          </button>

          <button
            type="button"
            onClick={onActiveToggle}
            className={adminSecondaryButtonClass}
          >
            {productForm.active ? "Visible" : "Hidden"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={adminSecondaryButtonClass}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmittingProduct}
            className={adminPrimaryButtonClass}
          >
            {isSubmittingProduct
              ? "Saving"
              : isEditingProduct
                ? "Update product"
                : "Save product"}
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
        className={`px-6 py-7 transition-[padding] duration-300 md:px-8 md:py-8 ${
          isSettingsOpen ? "xl:pr-[26rem]" : ""
        }`}
      >
        <label className="block">
          <input
            type="text"
            value={productForm.title}
            onChange={(event) => onTitleChange(event.target.value)}
            className="w-full border-0 bg-transparent px-0 py-0 text-[clamp(2.5rem,5vw,4rem)] leading-[0.94] font-semibold tracking-[-0.05em] text-white outline-none placeholder:text-white/14"
            placeholder="Offer title"
            required
          />
        </label>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_24rem]">
          <div className="space-y-6">
            <label className="block">
              <span className={adminKickerClass}>Summary</span>
              <textarea
                value={productForm.summary}
                onChange={(event) => onSummaryChange(event.target.value)}
                className={`${adminTextareaClass} mt-3 min-h-32`}
                placeholder="What this offer is, who it is for, and what the buyer gets."
                required
              />
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className={adminKickerClass}>Price</span>
                <input
                  type="text"
                  value={productForm.price}
                  onChange={(event) => onPriceChange(event.target.value)}
                  inputMode="decimal"
                  className={`${adminInputClass} mt-3`}
                  placeholder="490"
                  required
                />
              </label>

              <label className="block">
                <span className={adminKickerClass}>Delivery</span>
                <input
                  type="text"
                  value={productForm.deliveryText}
                  onChange={(event) => onDeliveryTextChange(event.target.value)}
                  className={`${adminInputClass} mt-3`}
                  placeholder="Delivered in 5 business days"
                />
              </label>
            </div>

            <label className="block">
              <span className={adminKickerClass}>Highlights</span>
              <input
                type="text"
                value={productForm.highlights}
                onChange={(event) => onHighlightsChange(event.target.value)}
                className={`${adminInputClass} mt-3`}
                placeholder="3 mobile screens, handoff notes, design source"
                required
              />
            </label>

            <div>
              <span className={adminKickerClass}>Availability</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    ["AVAILABLE", "Available"],
                    ["COMING_SOON", "Not available yet"],
                    ["SOLD_OUT", "Sold out"],
                  ] as const satisfies ReadonlyArray<
                    readonly [AdminProductAvailability, string]
                  >
                ).map(([value, label]) => {
                  const active = productForm.availability === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onAvailabilityChange(value)}
                      className={`min-h-8 rounded-full border px-3 text-[0.78rem] font-medium transition ${
                        active
                          ? "border-white/18 bg-white/[0.08] text-white"
                          : "border-white/8 bg-white/[0.03] text-white/52 hover:border-white/12 hover:text-white/76"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-sm text-white/42">
                Controls whether checkout is open, paused, or sold out.
              </p>
            </div>

            <div className={`${adminPanelMutedClass} p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={adminKickerClass}>Buyer brief</p>
                  <p className="mt-2 text-sm text-white/42">
                    Ask buyers to describe what they need before payment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onRequiresBriefToggle}
                  className={adminSecondaryButtonClass}
                >
                  {productForm.requiresBrief ? "Required" : "Optional"}
                </button>
              </div>

              {productForm.requiresBrief ? (
                <label className="mt-5 block">
                  <span className={adminKickerClass}>Optional prompt</span>
                  <textarea
                    value={productForm.briefPrompt}
                    onChange={(event) => onBriefPromptChange(event.target.value)}
                    className={`${adminTextareaClass} mt-3 min-h-24`}
                    placeholder="Tell me what you need, what the product should cover, and any references or constraints."
                  />
                  <p className="mt-2 text-sm text-white/42">
                    Leave this empty to use the default buyer brief prompt on the shop page.
                  </p>
                </label>
              ) : null}
            </div>
          </div>

          <div className="space-y-5">
            <div className={`${adminPanelMutedClass} p-5`}>
              <p className={adminKickerClass}>Primary image</p>
              <input
                key={`product-primary-${productInputKey}`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={onPrimaryImageChange}
                className={`${adminFileInputClass} mt-4`}
                required={!isEditingProduct}
              />
              <p className="mt-3 text-sm text-white/42">
                {productForm.primaryImageFile?.name ||
                  (productExistingImages[0]
                    ? "Keeping current image"
                    : "No file selected")}
              </p>
            </div>

            <div className={`${adminPanelMutedClass} p-5`}>
              <p className={adminKickerClass}>Secondary image</p>
              <input
                key={`product-secondary-${productInputKey}`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={onSecondaryImageChange}
                className={`${adminFileInputClass} mt-4`}
              />
              <p className="mt-3 text-sm text-white/42">
                {productForm.secondaryImageFile?.name ||
                  (productExistingImages[1]
                    ? "Keeping current image"
                    : "Optional second image")}
              </p>
            </div>
          </div>
        </div>

        <PostContentEditor
          editorKey={editorKey}
          initialHtml={productForm.contentHtml}
          onChange={onContentChange}
        />
      </div>

      <aside
        id="product-seo-settings"
        className={`fixed top-14 right-0 bottom-0 z-30 w-full max-w-[24rem] overflow-y-auto border-l border-white/6 bg-[#17191c]/96 shadow-[-24px_0_48px_rgba(0,0,0,0.22)] backdrop-blur transition-transform duration-300 ${
          isSettingsOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isSettingsOpen}
      >
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/6 px-5">
          <div>
            <p className="text-[0.98rem] font-semibold text-white">Product settings</p>
            <p className="mt-1 text-xs text-white/34">Search and social preview</p>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/8 bg-white/[0.03] text-white/56 transition hover:border-white/12 hover:bg-white/[0.06] hover:text-white"
          >
            <span className="sr-only">Close product settings</span>
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
                  value={productForm.seoTitle}
                  onChange={(event) => onSeoTitleChange(event.target.value)}
                  className={`${adminInputClass} mt-3`}
                  placeholder="Defaults to the product title"
                  maxLength={191}
                />
              </label>

              <label className="block">
                <span className={adminKickerClass}>SEO description</span>
                <textarea
                  value={productForm.seoDescription}
                  onChange={(event) => onSeoDescriptionChange(event.target.value)}
                  className={`${adminTextareaClass} mt-3 min-h-28`}
                  placeholder="Defaults to the product summary"
                  maxLength={320}
                />
              </label>

              <label className="block">
                <span className={adminKickerClass}>SEO image URL</span>
                <input
                  type="text"
                  value={productForm.seoImage}
                  onChange={(event) => onSeoImageChange(event.target.value)}
                  className={`${adminInputClass} mt-3`}
                  placeholder="Defaults to the primary product image"
                />
              </label>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
