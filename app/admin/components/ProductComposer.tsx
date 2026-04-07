"use client";

import dynamic from "next/dynamic";
import type { ChangeEventHandler, FormEventHandler } from "react";

import type { AdminProductAvailability, ProductFormState } from "./types";

const PostContentEditor = dynamic(() => import("../PostContentEditor"), {
  ssr: false,
  loading: () => (
    <div className="admin-panel-muted mt-4 min-h-[18rem] px-5 py-5">
      <p className="admin-kicker">Loading editor</p>
    </div>
  ),
});

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
            onClick={() =>
              onKindChange(
                productForm.kind === "SERVICE" ? "DIGITAL" : "SERVICE",
              )
            }
            className="admin-button-secondary"
          >
            {productForm.kind === "SERVICE" ? "Service" : "Digital"}
          </button>

          <button
            type="button"
            onClick={onActiveToggle}
              className="admin-button-secondary"
            >
              {productForm.active ? "Visible" : "Hidden"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="admin-button-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmittingProduct}
              className="admin-button-primary"
            >
              {isSubmittingProduct
                ? "Saving"
                : isEditingProduct
                  ? "Update product"
                  : "Save product"}
            </button>
          </div>
        </div>

      <div className="px-6 py-7 md:px-8 md:py-8">
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
              <span className="admin-kicker">Summary</span>
              <textarea
                value={productForm.summary}
                onChange={(event) => onSummaryChange(event.target.value)}
                className="admin-textarea mt-3 min-h-32"
                placeholder="What this offer is, who it is for, and what the buyer gets."
                required
              />
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="admin-kicker">Price</span>
                <input
                  type="text"
                  value={productForm.price}
                  onChange={(event) => onPriceChange(event.target.value)}
                  inputMode="decimal"
                  className="admin-field mt-3"
                  placeholder="490"
                  required
                />
              </label>

              <label className="block">
                <span className="admin-kicker">Delivery</span>
                <input
                  type="text"
                  value={productForm.deliveryText}
                  onChange={(event) => onDeliveryTextChange(event.target.value)}
                  className="admin-field mt-3"
                  placeholder="Delivered in 5 business days"
                />
              </label>
            </div>

            <label className="block">
              <span className="admin-kicker">Highlights</span>
              <input
                type="text"
                value={productForm.highlights}
                onChange={(event) => onHighlightsChange(event.target.value)}
                className="admin-field mt-3"
                placeholder="3 mobile screens, handoff notes, design source"
                required
              />
            </label>

            <div>
              <span className="admin-kicker">Availability</span>
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
                      className={`min-h-10 rounded-full border px-4 text-sm font-medium transition ${
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

            <div className="admin-panel-muted p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="admin-kicker">Buyer brief</p>
                  <p className="mt-2 text-sm text-white/42">
                    Ask buyers to describe what they need before payment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onRequiresBriefToggle}
                  className="admin-button-secondary"
                >
                  {productForm.requiresBrief ? "Required" : "Optional"}
                </button>
              </div>

              {productForm.requiresBrief ? (
                <label className="mt-5 block">
                  <span className="admin-kicker">Optional prompt</span>
                  <textarea
                    value={productForm.briefPrompt}
                    onChange={(event) => onBriefPromptChange(event.target.value)}
                    className="admin-textarea mt-3 min-h-24"
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
            <div className="admin-panel-muted p-5">
              <p className="admin-kicker">Primary image</p>
              <input
                key={`product-primary-${productInputKey}`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={onPrimaryImageChange}
                className="admin-file mt-4"
                required={!isEditingProduct}
              />
              <p className="mt-3 text-sm text-white/42">
                {productForm.primaryImageFile?.name ||
                  (productExistingImages[0]
                    ? "Keeping current image"
                    : "No file selected")}
              </p>
            </div>

            <div className="admin-panel-muted p-5">
              <p className="admin-kicker">Secondary image</p>
              <input
                key={`product-secondary-${productInputKey}`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={onSecondaryImageChange}
                className="admin-file mt-4"
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
    </form>
  );
}
