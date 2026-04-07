export const SHOP_CURRENCY = "EUR";
export const SHOP_BRIEF_MIN_LENGTH = 8;
export type ShopAvailability = "AVAILABLE" | "COMING_SOON" | "SOLD_OUT";

export function formatPrice(priceCents: number, currency = SHOP_CURRENCY) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(priceCents / 100);
}

export function getProductKindLabel(kind: string) {
  return kind === "DIGITAL" ? "Digital product" : "Service";
}

export function getShopAvailabilityLabel(availability: ShopAvailability) {
  if (availability === "COMING_SOON") {
    return "Not available yet";
  }

  if (availability === "SOLD_OUT") {
    return "Sold out";
  }

  return "Available";
}

export function isShopProductPurchasable(
  active: boolean,
  availability: ShopAvailability,
) {
  return active && availability === "AVAILABLE";
}
