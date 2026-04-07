import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/app/components/layout/Footer";
import { normalizeShopProductRecord } from "@/lib/db-json";
import { shouldBypassImageOptimization } from "@/lib/image";
import { getExcerptFromHtml, getReadingTimeMinutes } from "@/lib/post-content";
import { getPayPalClientId } from "@/lib/paypal";
import prisma from "@/lib/prisma";
import { getPublicModuleSettings } from "@/lib/settings";
import {
  formatPrice,
  getProductKindLabel,
  getShopAvailabilityLabel,
  isShopProductPurchasable,
} from "@/lib/shop-helpers";
import { siteConfig } from "@/lib/site";

import PayPalCheckout from "./PayPalCheckout";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

type ShopProductDetail = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string | null;
  priceCents: number;
  currency: string;
  kind: "SERVICE" | "DIGITAL";
  active: boolean;
  availability: "AVAILABLE" | "COMING_SOON" | "SOLD_OUT";
  requiresBrief: boolean;
  briefPrompt: string | null;
  deliveryText: string | null;
  highlights: string[];
  images: string[];
};

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  const product = await prisma.shopProduct.findUnique({
    where: { slug },
  });

  if (!product || !product.active) {
    return null;
  }

  return normalizeShopProductRecord(product) as ShopProductDetail;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const settings = await getPublicModuleSettings();

  if (!settings.shopEnabled) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const description = product.summary || getExcerptFromHtml(product.content, 160);
  const canonicalPath = `/shop/${product.slug}`;

  return {
    title: product.title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      title: product.title,
      description,
      url: canonicalPath,
      images: product.images[0]
        ? [{ url: product.images[0], alt: product.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ShopProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const settings = await getPublicModuleSettings();

  if (!settings.shopEnabled) {
    notFound();
  }

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const readingTime = getReadingTimeMinutes(product.content);
  const productUrl = `${siteConfig.url}/shop/${product.slug}`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.summary,
    image: product.images,
    url: productUrl,
    brand: { "@type": "Brand", name: siteConfig.shortName },
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.priceCents / 100).toFixed(2),
      availability:
        product.availability === "AVAILABLE"
          ? "https://schema.org/InStock"
          : product.availability === "COMING_SOON"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/SoldOut",
      url: productUrl,
    },
  };

  const canPurchase = isShopProductPurchasable(
    product.active,
    product.availability,
  );
  const availabilityLabel = getShopAvailabilityLabel(product.availability);

  return (
    <>
      <section className="shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />

        <div className="front-page-header front-rule lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
          <div className="max-w-4xl">
            <p className="front-kicker">{getProductKindLabel(product.kind)}</p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.5rem,5vw,4.2rem)] leading-[0.95] font-medium tracking-[-0.055em]">
              {product.title}
            </h1>
            <p className="front-copy mt-5 max-w-2xl">{product.summary}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="front-pill">{availabilityLabel}</span>
              <span className="front-meta">{readingTime} min read</span>
            </div>
          </div>

          <div className="mt-8 lg:mt-0">
            <div className="front-card p-6">
              <p className="front-kicker">Purchase</p>
              <p className="mt-4 text-[2.6rem] leading-none font-medium tracking-[-0.05em]">
                {formatPrice(product.priceCents, product.currency)}
              </p>
              <div className="mt-5 space-y-3 text-sm text-base-content/62">
                <p>{getProductKindLabel(product.kind)}</p>
                <p>{availabilityLabel}</p>
                <p>{product.deliveryText || "Follow-up by email after payment"}</p>
              </div>

              <div className="mt-6 border-t border-[var(--line-soft)] pt-5">
                <PayPalCheckout
                  clientId={getPayPalClientId()}
                  currency={product.currency}
                  productId={product.id}
                  available={canPurchase}
                  unavailableMessage={availabilityLabel}
                  requiresBrief={product.requiresBrief}
                  briefPrompt={product.briefPrompt}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,22rem)]">
          <div className="min-w-0">
            {product.images[0] ? (
              <div className="media-frame aspect-[16/10]">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  priority
                  unoptimized={shouldBypassImageOptimization(product.images[0])}
                  sizes="(max-width: 1023px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            {product.content ? (
              <div
                className="post-content mt-8 max-w-3xl text-[1.02rem] leading-[1.82]"
                dangerouslySetInnerHTML={{ __html: product.content }}
              />
            ) : null}

            {product.images[1] ? (
              <div className="media-frame mt-10 aspect-[16/10]">
                <Image
                  src={product.images[1]}
                  alt={`${product.title} secondary preview`}
                  fill
                  unoptimized={shouldBypassImageOptimization(product.images[1])}
                  sizes="(max-width: 1023px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>

          <aside className="space-y-5">
            {product.highlights.length > 0 ? (
              <div className="front-card p-5">
                <p className="front-kicker">Included</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.highlights.map((highlight) => (
                    <span key={highlight} className="front-chip">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="front-card p-5">
              <p className="front-kicker">Need a tailored version?</p>
              <p className="front-meta mt-4">
                If the standard offer is close but not exact, send the brief
                through contact and I can scope a custom version.
              </p>
              <Link href="/contact" className="front-link mt-5">
                Contact
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </>
  );
}
