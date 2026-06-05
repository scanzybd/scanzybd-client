/** PDF page sizes in mm (portrait). Same values as AllQR / GenerateQR. */
export const PDF_PAGE_FORMATS = [
  { label: "A4", value: "a4", w: 210, h: 297 },
  { label: "Letter", value: "letter", w: 216, h: 279 },
  { label: "Legal", value: "legal", w: 216, h: 356 },
  { label: "A3", value: "a3", w: 297, h: 420 },
  { label: "Tabloid", value: "tabloid", w: 279, h: 432 },
  { label: "Custom", value: "custom", w: 210, h: 297 },
];

export const PDF_ORIENTATIONS = [
  { label: "Portrait", value: "p" },
  { label: "Landscape", value: "l" },
];

export function getPageDimensionsMm(format, orientation, customW = 210, customH = 297) {
  const fmt = PDF_PAGE_FORMATS.find((f) => f.value === format) || PDF_PAGE_FORMATS[0];
  let w = format === "custom" ? Math.max(20, Number(customW) || 210) : fmt.w;
  let h = format === "custom" ? Math.max(20, Number(customH) || 297) : fmt.h;
  if (orientation === "l") {
    [w, h] = [h, w];
  }
  return { w, h };
}

function normalizeInsets(inset) {
  return {
    top: Number(inset?.top) ?? 0,
    bottom: Number(inset?.bottom) ?? 0,
    left: Number(inset?.left) ?? 0,
    right: Number(inset?.right) ?? 0,
    gap: Number(inset?.gap) ?? 0,
  };
}

/**
 * Mirrors placeVectorStickerOnPage pagination — returns sticker boxes in mm per page.
 */
export function simulateStickerLayout({
  pageW,
  pageH,
  stickerMm,
  pageInset,
  textBlockMm = 0,
  maxStickers = 48,
}) {
  const { top, bottom, left, right, gap } = normalizeInsets(pageInset);
  const sw = Math.max(1, Number(stickerMm?.w) || 80);
  const sh = Math.max(1, Number(stickerMm?.h) || 45);
  const blockH = sh + textBlockMm;

  const pages = [];
  let pagePlacements = [];
  let x = left;
  let y = top;
  let rowHeight = 0;
  let count = 0;

  const flushPage = () => {
    if (pagePlacements.length > 0) {
      pages.push({ index: pages.length, placements: pagePlacements });
      pagePlacements = [];
    }
  };

  while (count < maxStickers) {
    if (x + sw > pageW - right) {
      x = left;
      y += rowHeight + gap;
      rowHeight = 0;
    }

    if (y + blockH > pageH - bottom) {
      flushPage();
      x = left;
      y = top;
      rowHeight = 0;
      if (y + blockH > pageH - bottom) break;
    }

    pagePlacements.push({ x, y, w: sw, h: sh, index: count });
    count += 1;
    rowHeight = Math.max(rowHeight, blockH);
    x += sw + gap;
  }

  flushPage();

  return {
    pages,
    firstPageCount: pages[0]?.placements.length ?? 0,
    totalSimulated: count,
  };
}
