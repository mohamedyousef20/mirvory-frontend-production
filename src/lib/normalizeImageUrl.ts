/**
 * normalizeImageUrl.ts
 *
 * Fixes malformed Cloudinary URLs and optionally injects transformation params
 * (f_auto, q_auto, w_N) for efficient image delivery.
 *
 * Width presets:
 *   thumbnail  → 200   (mini thumbnails, cart previews)
 *   card       → 400   (product cards in grids)
 *   product    → 800   (main product page image)
 *   hero       → 1200  (hero carousel full-width banners)
 *   original   → undefined  (no width restriction)
 *
 * Non-Cloudinary URLs are returned unchanged (no transformation injected).
 * Already-transformed URLs (containing /upload/f_auto or /upload/w_) are
 * returned with at most a width update so we never double-transform.
 */

export type CloudinaryWidth = 200 | 400 | 800 | 1200;
export type ImagePreset = 'thumbnail' | 'card' | 'product' | 'hero' | 'original';

const PRESET_WIDTHS: Record<Exclude<ImagePreset, 'original'>, CloudinaryWidth> = {
  thumbnail: 200,
  card: 400,
  product: 800,
  hero: 1200,
};

/**
 * Repair common Cloudinary URL malformations.
 */
function repairCloudinaryUrl(url: string): string {
  let cleaned = url.trim();

  // Fix malformed protocol (e.g. "https:res.cloudinary.com...")
  if (cleaned.startsWith('https:') && !cleaned.startsWith('https://')) {
    cleaned = cleaned.replace(/^https:/, 'https://');
  } else if (cleaned.startsWith('http:') && !cleaned.startsWith('http://')) {
    cleaned = cleaned.replace(/^http:/, 'http://');
  }

  // Ensure slash after Cloudinary domain
  cleaned = cleaned.replace(/(https?:\/\/res\.cloudinary\.com)(?!\/)/, '$1/');

  // Fix missing slash between 'image' and 'upload'
  cleaned = cleaned.replace(/imageupload/, 'image/upload');

  // Ensure slash after 'upload'
  cleaned = cleaned.replace(/image\/upload(?!\/)/, 'image/upload/');

  return cleaned;
}

/**
 * Check whether a URL points to Cloudinary.
 */
function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

/**
 * Inject or replace Cloudinary transformation parameters.
 *
 * Strategy:
 *   - If the URL already has a transformation segment (anything between
 *     /upload/ and the version/public-id), replace it entirely.
 *   - Otherwise, insert the transformation right after /upload/.
 *
 * The resulting transformation is always: f_auto,q_auto[,w_N]
 */
function injectTransformations(url: string, width?: CloudinaryWidth): string {
  // Match the /upload/ segment and whatever comes right after it before the
  // actual asset path.  Cloudinary transformation segments look like
  // "f_auto,q_auto,w_400/" or "v1234/" or nothing.
  //
  // Pattern explanation:
  //   (.*\/image\/upload\/) – capture everything up to and including /upload/
  //   ([^v][^/]+\/)?        – optionally capture an existing non-version xform segment
  //   (v\d+\/)?             – optionally capture a version segment like v1234/
  //   (.*)                  – capture the rest (public id + extension)
  const uploadRegex = /^(.*\/image\/upload\/)(?:(?!v\d)([^/]+\/))?(?:(v\d+\/))?(.*)$/;
  const match = url.match(uploadRegex);

  if (!match) {
    // Unexpected format — return as-is
    return url;
  }

  const [, prefix, , version, publicId] = match;

  const transforms = width
    ? `f_auto,q_auto,w_${width}/`
    : 'f_auto,q_auto/';

  return `${prefix}${transforms}${version ?? ''}${publicId}`;
}

/**
 * Normalize a potentially malformed image URL and optionally apply
 * Cloudinary transformations.
 *
 * @param url     Raw image URL (may be malformed, Cloudinary or external).
 * @param preset  Transformation preset. Defaults to 'original' (no transform).
 *
 * @example
 *   // Product card thumbnail
 *   normalizeImageUrl(product.image, 'card')
 *   // → https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400/sample.jpg
 *
 *   // Hero image
 *   normalizeImageUrl(hero.image, 'hero')
 *   // → https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1200/banner.jpg
 */
export function normalizeImageUrl(
  url?: string | null,
  preset: ImagePreset = 'original',
): string {
  if (!url) {
    return '/placeholder.svg';
  }

  const repaired = repairCloudinaryUrl(url);

  // Non-Cloudinary URLs: return repaired URL without transformations
  if (!isCloudinaryUrl(repaired)) {
    return repaired;
  }

  // Cloudinary URL: inject transformation parameters
  const width = preset !== 'original' ? PRESET_WIDTHS[preset] : undefined;
  return injectTransformations(repaired, width);
}

/**
 * Convenience helpers for common use-cases.
 * Import these directly when you know the context.
 */
export const thumbnailUrl = (url?: string | null) =>
  normalizeImageUrl(url, 'thumbnail');

export const cardImageUrl = (url?: string | null) =>
  normalizeImageUrl(url, 'card');

export const productImageUrl = (url?: string | null) =>
  normalizeImageUrl(url, 'product');

export const heroImageUrl = (url?: string | null) =>
  normalizeImageUrl(url, 'hero');
