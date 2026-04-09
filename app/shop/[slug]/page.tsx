import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/app/components/layout/Footer";
import { normalizeShopProductRecord } from "@/lib/db-json";
import {
  shouldBypassImageOptimization,
  toAbsoluteImageUrl,
} from "@/lib/image";
import {
  getExcerptFromHtml,
  getReadingTimeMinutes,
  sanitizeRichHtml,
} from "@/lib/post-content";
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
  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;
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

  const fallbackDescription =
    product.summary || getExcerptFromHtml(product.content, 160);
  const metadataTitle = product.seoTitle || product.title;
  const metadataDescription = product.seoDescription || fallbackDescription;
  const canonicalPath = `/shop/${product.slug}`;
  const shareImage = toAbsoluteImageUrl(
    product.seoImage || product.images[0],
    siteConfig.url,
  );

  return {
    title: metadataTitle,
    description: metadataDescription,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      title: metadataTitle,
      description: metadataDescription,
      url: canonicalPath,
      images: shareImage
        ? [{ url: shareImage, alt: metadataTitle }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: metadataTitle,
      description: metadataDescription,
      images: shareImage ? [shareImage] : undefined,
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
  const sanitizedContent = sanitizeRichHtml(product.content);
  const productUrl = `${siteConfig.url}/shop/${product.slug}`;
  const metadataDescription =
    product.seoDescription ||
    product.summary ||
    getExcerptFromHtml(product.content, 160);
  const productImages = product.images
    .map((image) => toAbsoluteImageUrl(image, siteConfig.url))
    .filter((image): image is string => Boolean(image));
  const shareImage = toAbsoluteImageUrl(
    product.seoImage || product.images[0],
    siteConfig.url,
  );
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: metadataDescription,
    image: shareImage
      ? [shareImage, ...productImages.filter((image) => image !== shareImage)]
      : productImages,
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

        <div className="front-rule py-[clamp(3rem,6vw,5.5rem)] lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
          <div className="max-w-4xl">
            <p className="front-kicker">{getProductKindLabel(product.kind)}</p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.5rem,5vw,4.2rem)] leading-[0.95] font-medium tracking-[-0.055em]">
              {product.title}
            </h1>
            <p className="mt-5 max-w-2xl text-[1.03rem] leading-[1.72] text-base-content/72">
              {product.summary}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-[var(--line-soft)] bg-transparent px-[0.8rem] py-[0.35rem] text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-base-content/66">
                {availabilityLabel}
              </span>
              <span className="text-[0.9rem] leading-[1.6] text-base-content/62">
                {readingTime} min read
              </span>
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
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
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
                    <span
                      key={highlight}
                      className="inline-flex items-center rounded-full border border-[var(--line-soft)] px-3 py-[0.3rem] text-[0.84rem] text-base-content/72"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="front-card p-5">
              <p className="front-kicker">Need a tailored version?</p>
              <p className="mt-4 text-[0.9rem] leading-[1.6] text-base-content/62">
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
