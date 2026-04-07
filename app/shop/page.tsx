import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "../components/layout/Footer";

import { normalizeShopProductRecord } from "@/lib/db-json";
import prisma from "@/lib/prisma";
import { getPublicModuleSettings } from "@/lib/settings";
import { formatPrice, getProductKindLabel } from "@/lib/shop-helpers";
import { siteConfig } from "@/lib/site";

type ShopProductPreview = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  priceCents: number;
  currency: string;
  kind: "SERVICE" | "DIGITAL";
  images: string[];
};

export const metadata: Metadata = {
  title: "Shop",
  description: `Products and service offers available on ${siteConfig.name}.`,
  alternates: {
    canonical: "/shop",
  },
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const settings = await getPublicModuleSettings();

  if (!settings.shopEnabled) {
    notFound();
  }

  const products = await prisma.shopProduct.findMany({
    where: { active: true },
    orderBy: { id: "desc" },
  });

  const items = products.map(normalizeShopProductRecord) as ShopProductPreview[];

  return (
    <>
      <section className="shell">
        <div className="front-page-header front-rule lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
          <div className="max-w-sm">
            <p className="front-kicker">Shop</p>
            <h1 className="front-section-title mt-4">Products and offers.</h1>
          </div>

          <div className="mt-6 max-w-3xl lg:mt-0">
            <p className="front-copy">
              A clearer commerce surface: structured cards, visible pricing, and
              direct calls to action instead of archive-style browsing.
            </p>
          </div>
        </div>
      </section>

      <section className="shell">
        {items.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {items.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="front-card block p-6 transition hover:opacity-90"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="front-pill">
                    {getProductKindLabel(product.kind)}
                  </span>
                  <span className="text-[1.05rem] font-medium tracking-[-0.03em]">
                    {formatPrice(product.priceCents, product.currency)}
                  </span>
                </div>

                <h2 className="mt-6 text-[1.55rem] leading-[1] font-medium tracking-[-0.045em]">
                  {product.title}
                </h2>
                <p className="front-meta mt-3">{product.summary}</p>

                <div className="mt-6">
                  <span className="front-button-subtle min-h-9 px-4 text-sm">
                    View offer
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="front-card p-6 md:p-8">
            <p className="front-kicker">No live offers</p>
            <p className="front-copy mt-4">
              Publish products in admin and they will appear here automatically.
            </p>
          </div>
        )}
      </section>

      <section className="shell mt-8">
        <div className="front-rule pt-8">
          <Link href="/contact" className="front-button">
            Need something custom?
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
