/** Max gallery images per product (cover = first). */
export const PRODUCT_IMAGE_SLOTS = 4;

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
