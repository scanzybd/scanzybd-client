/** Legacy hardcoded defaults — used if API templates unavailable. */

export const LEGACY_QR_FRAMES = [
  {
    slug: "bike",
    label: "Bike tag",
    category: "bike",
    icon: "bike",
    svgPath: "/qr-frame/bike.svg",
    hasSvgMarkup: false,
    overlay: { top: 50, left: 26, size: 28 },
    overlayCss: { top: 50, left: 26, size: 35 },
    frameZoom: 1,
    frameOffsetX: "0%",
    frameOffsetY: "0%",
    stickerMm: { w: 82.55, h: 44.45 },
    cardSize: {
      width: Math.round((180 * 82.55) / 44.45),
      height: 180,
    },
    pageInset: { top: 6, bottom: 6, left: 4, right: 4, gap: 2 },
    sortOrder: 1,
  },
  {
    slug: "car",
    label: "Car tag",
    category: "car",
    icon: "car",
    svgPath: "/qr-frame/car.svg",
    hasSvgMarkup: false,
    overlay: { top: 40, left: 50, size: 52 },
    overlayCss: { top: 40, left: 50, size: 65 },
    frameZoom: 1,
    frameOffsetX: "0%",
    frameOffsetY: "0%",
    stickerMm: { w: 69.85, h: 95.25 },
    cardSize: {
      width: Math.round((410 * 69.85) / 95.25),
      height: 410,
    },
    pageInset: { top: 6, bottom: 6, left: 4, right: 4, gap: 2 },
    sortOrder: 2,
  },
];
