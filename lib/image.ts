export function shouldBypassImageOptimization(src: string | null | undefined) {
  return Boolean(src && src.startsWith("/uploads/"));
}

export function isAbsoluteImageUrl(src: string | null | undefined) {
  return Boolean(src && /^https?:\/\//i.test(src));
}

export function toAbsoluteImageUrl(
  src: string | null | undefined,
  siteUrl: string,
) {
  if (!src) {
    return null;
  }

  return isAbsoluteImageUrl(src) ? src : `${siteUrl}${src}`;
}
