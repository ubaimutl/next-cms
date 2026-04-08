"use client";

import Link from "next/link";

import {
  formatPrice,
  getProductKindLabel,
} from "@/lib/shop-helpers";

import {
  ProductAvailabilityPill,
  StatusPill,
  adminPillClass,
  adminTableHeadClass,
} from "./ui";
import type { AdminProduct } from "./types";

type ShopSectionProps = {
  products: AdminProduct[];
  isDeletingProductId: number | null;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
};

export default function ShopSection({
  products,
  isDeletingProductId,
  onEdit,
  onDelete,
}: ShopSectionProps) {
  return (
    <section className="admin-panel overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[64rem]">
          <div className="grid grid-cols-[minmax(0,1.8fr)_8rem_8rem_12rem_12rem_8rem] gap-4 border-b border-white/6 px-6 py-4 md:px-8">
            <span className={adminTableHeadClass}>Offer</span>
            <span className={adminTableHeadClass}>Type</span>
            <span className={`${adminTableHeadClass} text-right`}>Price</span>
            <span className={`${adminTableHeadClass} text-center`}>Status</span>
            <span className={adminTableHeadClass}>Path</span>
            <span className={`${adminTableHeadClass} text-right`}>Actions</span>
          </div>

        {products.length === 0 ? (
            <div className="px-6 py-8 text-sm text-white/46 md:px-8">
              No products yet.
            </div>
        ) : (
          products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[minmax(0,1.8fr)_8rem_8rem_12rem_12rem_8rem] gap-4 border-b border-white/6 px-6 py-5 last:border-b-0 md:px-8"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-[1rem] font-semibold text-white/94">
                      {product.title}
                    </h3>
                    <span className={adminPillClass("neutral")}>
                      {getProductKindLabel(product.kind)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 max-w-3xl text-[0.92rem] leading-relaxed text-white/42">
                    {product.summary}
                  </p>
                </div>

                <div className="flex items-center text-sm text-white/56">
                  {getProductKindLabel(product.kind)}
                </div>

                <div className="text-right text-sm text-white/54">
                  {formatPrice(product.priceCents, product.currency)}
                </div>

                <div className="flex items-center justify-center">
                  {!product.active ? (
                    <StatusPill published={false} labels={["Hidden", "Live"]} />
                  ) : (
                    <ProductAvailabilityPill availability={product.availability} />
                  )}
                </div>

                <div className="flex items-center">
                  <span className="truncate text-sm text-white/42">
                    /shop/{product.slug}
                  </span>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  {product.active ? (
                    <Link
                      href={`/shop/${product.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-white/58 transition hover:text-white"
                    >
                      Preview
                    </Link>
                  ) : (
                    <span className="text-sm text-white/34">Hidden</span>
                  )}
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="text-sm text-white/68 transition hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    disabled={isDeletingProductId === product.id}
                    className="text-sm text-[#ff8f8f] transition hover:text-[#ffb1b1] disabled:opacity-45"
                  >
                    {isDeletingProductId === product.id ? "Deleting" : "Delete"}
                  </button>
                </div>
              </div>
          ))
        )}
        </div>
      </div>
    </section>
  );
}
