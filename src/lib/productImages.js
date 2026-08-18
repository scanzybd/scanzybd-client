/** Max gallery images per product (cover = first). */
export const PRODUCT_IMAGE_SLOTS = 4;

/** Display widths for Cloudinary transforms (read/load optimization). */
export const PRODUCT_IMAGE_WIDTHS = {
  thumb: 160,
  cart: 128,
  card: 800,
  spotlight: 1000,
  detail: 1200,
  admin: 640,
};

const CLOUDINARY_HOST = "res.cloudinary.com";
const UPLOAD_SEGMENT = "/upload/";

/**
 * Cloudinary delivery URL with resize/quality/format transforms.
 * Non-Cloudinary URLs (local fallback, external) are returned unchanged.
 */
export function cloudinaryImageUrl(url, options = {}) {
  const {
    width,
    height,
    crop = "limit",
    quality = "auto:good",
    format = "auto",
  } = options;

  if (!url || typeof url !== "string") return url || "";
  const src = url.trim();
  if (!src.includes(CLOUDINARY_HOST) || !src.includes(UPLOAD_SEGMENT)) {
    return src;
  }

  const parts = [];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width && height && crop) parts.push(`c_${crop}`);
  else if (width || height) parts.push("c_limit");
  parts.push(`q_${quality}`, `f_${format}`);
  const transform = parts.join(",");

  const splitAt = src.indexOf(UPLOAD_SEGMENT);
  const base = src.slice(0, splitAt + UPLOAD_SEGMENT.length);
  let path = src.slice(splitAt + UPLOAD_SEGMENT.length);

  // Drop an existing transformation segment before version or public_id path.
  while (path.length > 0) {
    const slash = path.indexOf("/");
    const segment = slash === -1 ? path : path.slice(0, slash);
    if (/^v\d+$/.test(segment)) break;
    if (/^(w_|h_|c_|q_|f_|g_|e_|fl_|dpr_|ar_)/.test(segment) || segment.includes(",")) {
      path = slash === -1 ? "" : path.slice(slash + 1);
      continue;
    }
    break;
  }

  return `${base}${transform}/${path}`;
}

/** Preset wrapper — e.g. productImageUrl(url, "card") */
export function productImageUrl(url, preset = "card", fallback = "") {
  const raw = url || fallback;
  const width = PRODUCT_IMAGE_WIDTHS[preset] ?? PRODUCT_IMAGE_WIDTHS.card;
  const height =
    preset === "thumb" || preset === "cart"
      ? width
      : undefined;
  const crop =
    preset === "thumb" || preset === "cart" ? "fill" : "limit";

  return cloudinaryImageUrl(raw, { width, height, crop });
}

/** Unique non-empty image URLs from `images` + legacy `image`, max 4. */
export function normalizeProductImages(product) {
  const list = [];
  const push = (u) => {
    if (typeof u !== "string") return;
    const t = u.trim();
    if (!t || list.includes(t)) return;
    list.push(t);
  };

  if (Array.isArray(product?.images)) {
    for (const u of product.images) push(u);
  }
  push(product?.image);

  return list.slice(0, PRODUCT_IMAGE_SLOTS);
}

export function productCoverImage(product, fallback = "") {
  return normalizeProductImages(product)[0] || fallback;
}

export function productCoverImageUrl(product, preset = "card", fallback = "") {
  return productImageUrl(productCoverImage(product, fallback), preset, fallback);
}

/** Always length-4 slots for add/edit forms. */
export function imagesToFormSlots(product) {
  const imgs = normalizeProductImages(product);
  return Array.from({ length: PRODUCT_IMAGE_SLOTS }, (_, i) => imgs[i] || "");
}

/** Payload for API: trimmed images + cover `image`. */
export function buildImagesPayload(slots) {
  const images = (Array.isArray(slots) ? slots : [])
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean)
    .slice(0, PRODUCT_IMAGE_SLOTS);
  return {
    images,
    image: images[0] || "",
  };
}
