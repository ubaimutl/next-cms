"use client";

import Image from "next/image";

import { adminKickerClass, adminPillClass, formatDateTime, formatFileSize } from "./ui";
import type { AdminMediaAsset } from "./types";

type MediaSectionProps = {
  assets: AdminMediaAsset[];
  isDeletingMediaId: number | null;
  onDelete: (asset: AdminMediaAsset) => void;
};

function kindLabel(kind: AdminMediaAsset["kind"]) {
  if (kind === "POST_IMAGE") {
    return "Post image";
  }

  if (kind === "PROJECT_IMAGE") {
    return "Project image";
  }

  return "Product image";
}

export default function MediaSection({
  assets,
  isDeletingMediaId,
  onDelete,
}: MediaSectionProps) {
  if (assets.length === 0) {
    return (
      <section className="admin-panel px-6 py-8 text-sm text-white/46 md:px-8">
        No uploaded assets are tracked yet.
      </section>
    );
  }

  return (
    <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {assets.map((asset) => (
        <article key={asset.id} className="admin-panel overflow-hidden">
          <div className="relative aspect-[16/10] bg-black/20">
            <Image
              src={asset.url}
              alt={asset.pathname}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
              className="object-cover"
            />
          </div>

          <div className="space-y-4 px-5 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={adminPillClass("neutral")}>{kindLabel(asset.kind)}</span>
              <span className={adminPillClass("neutral")}>{asset.provider}</span>
              <span
                className={adminPillClass(
                  asset.usageCount > 0 ? "warning" : "success",
                )}
              >
                {asset.usageCount > 0
                  ? `${asset.usageCount} in use`
                  : "Unused"}
              </span>
            </div>

            <div>
              <p className={adminKickerClass}>Path</p>
              <p className="mt-2 break-all text-sm text-white/74">{asset.pathname}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className={adminKickerClass}>Uploaded</p>
                <p className="mt-2 text-sm text-white/66">{formatDateTime(asset.createdAt)}</p>
              </div>
              <div>
                <p className={adminKickerClass}>File</p>
                <p className="mt-2 text-sm text-white/66">
                  {formatFileSize(asset.size)} · {asset.mimeType}
                </p>
              </div>
            </div>

            <div>
              <p className={adminKickerClass}>Uploader</p>
              <p className="mt-2 text-sm text-white/66">
                {asset.uploadedByName?.trim() ||
                  asset.uploadedByEmail ||
                  "Unknown"}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/6 pt-4">
              <a
                href={asset.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-white/64 transition hover:text-white"
              >
                Open asset
              </a>

              <button
                type="button"
                onClick={() => onDelete(asset)}
                disabled={asset.usageCount > 0 || isDeletingMediaId === asset.id}
                className="text-sm text-[#ff8f8f] transition hover:text-[#ffb1b1] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isDeletingMediaId === asset.id ? "Deleting" : "Delete"}
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
