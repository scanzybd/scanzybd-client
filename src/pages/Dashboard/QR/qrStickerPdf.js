import QRCode from "qrcode";
import "svg2pdf.js";

/**
 * Shared sticker mm sizes and PDF helpers for GenerateQR + AllQR.
 * Sticker artwork uses STICKER_SIZE_MM; QR code label is drawn below the sticker box.
 */

/** Public paths for frame SVGs (fetch at runtime). */
export const QR_FRAME_URL = {
  bike: "/qr-frame/bike.svg",
  car: "/qr-frame/car.svg",
};

/** QR overlay on frame — percentages match GenerateQR QR_OVERLAY_LAYOUT. */
export const QR_OVERLAY_LAYOUT = {
  bike: { top: 50, left: 26, size: 28 },
  car: { top: 40, left: 50, size: 52 },
};

const frameSvgTemplateCache = new Map();
/**
 * Physical sticker size on PDF (exact mm).
 */
export const STICKER_SIZE_MM = {
  bike: { w: 82.55, h: 44.45 }, // 3.25 x 1.75 inch
  car: { w: 69.85, h: 95.25 }, // 2.75 x 3.75 inch
};

/**
 * Pixel size for html-to-image capture — widths/heights must match STICKER_SIZE_MM aspect
 * or jsPDF letterboxes inside the mm box (bike used to look side‑pinched).
 */
export const CARD_SIZE = {
  bike: {
    width: Math.round((180 * STICKER_SIZE_MM.bike.w) / STICKER_SIZE_MM.bike.h),
    height: 180,
  },
  car: {
    width: Math.round((410 * STICKER_SIZE_MM.car.w) / STICKER_SIZE_MM.car.h),
    height: 410,
  },
};

/** Gap between sticker bottom edge and QR code label (outside sticker mm box). */
export const QR_TEXT_GAP_MM = 2.2;
export const QR_TEXT_FONT_SIZE_PT = 8;
/** Vertical space reserved below sticker for gap + multi-line label (pagination). */
export const QR_TEXT_BLOCK_MM = 0;

/** Batch PDF: top/bottom/side insets; `gap` = horizontal space between stickers in a row. */
export const PDF_PAGE_INSET_BATCH = {
  top: 6,
  bottom: 6,
  left: 4,
  right: 4,
  gap: 2,
};

/** All QR list PDF: same + horizontal gap between columns. */
export const PDF_PAGE_INSET_ALL_QR = {
  top: 10,
  bottom: 10,
  left: 8,
  right: 8,
  gap: 4,
};

export function getStickerSizeMm(type) {
  return STICKER_SIZE_MM[type] || STICKER_SIZE_MM.bike;
}

function cardAspectRatio(qrType) {
  const c = CARD_SIZE[qrType] || CARD_SIZE.bike;
  return c.width / c.height;
}

function normalizePageInsets(pageLayoutMm) {
  if (!pageLayoutMm) {
    return { top: 0, bottom: 0, left: 0, right: 0, gap: 0 };
  }
  if (
    pageLayoutMm.top !== undefined ||
    pageLayoutMm.left !== undefined
  ) {
    return {
      top: pageLayoutMm.top ?? 0,
      bottom: pageLayoutMm.bottom ?? 0,
      left: pageLayoutMm.left ?? 0,
      right: pageLayoutMm.right ?? 0,
      gap: pageLayoutMm.gap ?? 0,
    };
  }
  const m = pageLayoutMm.margin ?? 0;
  return {
    top: m,
    bottom: m,
    left: m,
    right: m,
    gap: pageLayoutMm.gap ?? 0,
  };
}

/**
 * Draw captured PNG letterboxed inside (xMm,yMm) → stickerMm.w × stickerMm.h (exact mm).
 */
export function drawStickerImageInPdf(pdf, imgData, xMm, yMm, stickerMm, qrType) {
  const innerW = Math.max(1, stickerMm.w);
  const innerH = Math.max(1, stickerMm.h);
  const aspect = cardAspectRatio(qrType);
  const boxAspect = innerW / innerH;
  let imgW;
  let imgH;
  if (aspect >= boxAspect) {
    imgW = innerW;
    imgH = imgW / aspect;
  } else {
    imgH = innerH;
    imgW = imgH * aspect;
  }
  const imgX = xMm + (innerW - imgW) / 2;
  const imgY = yMm + (innerH - imgH) / 2;
  pdf.addImage(imgData, "PNG", imgX, imgY, imgW, imgH);
}

/**
 * QR label below the sticker (outside sticker height).
 */
export function drawQrLabelBelowSticker(pdf, codeText, xMm, yMm, stickerMm) {
  const label = codeText || "QR";
  pdf.setFont("courier", "normal");
  let fontSize = QR_TEXT_FONT_SIZE_PT;
  pdf.setFontSize(fontSize);
  const maxW = Math.max(10, stickerMm.w);
  let lines = pdf.splitTextToSize(label, maxW - 0.5);
  while (lines.length > 4 && fontSize > 5.5) {
    fontSize -= 0.5;
    pdf.setFontSize(fontSize);
    lines = pdf.splitTextToSize(label, maxW - 0.5);
  }
  const textY = yMm + stickerMm.h + QR_TEXT_GAP_MM;
  pdf.text(lines, xMm + stickerMm.w / 2, textY, {
    align: "center",
    baseline: "top",
  });
}

export function drawStickerWithLabelBelow(
  pdf,
  imgData,
  xMm,
  yMm,
  stickerMm,
  qrType,
  codeText
) {
  drawStickerImageInPdf(pdf, imgData, xMm, yMm, stickerMm, qrType);
  drawQrLabelBelowSticker(pdf, codeText, xMm, yMm, stickerMm);
}

/**
 * Place one sticker row on the page; label sits below sticker (outside sticker box).
 */
export function placeStickerOnPage(
  pdf,
  imgData,
  stickerMm,
  cursor,
  pageSize,
  pageLayout,
  codeText,
  qrType,
  pageLayoutMm = PDF_PAGE_INSET_BATCH
) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const { top, bottom, left, right, gap } = normalizePageInsets(pageLayoutMm);

  let { x, y, rowHeight } = cursor;

  if (x + stickerMm.w > pageW - right) {
    x = left;
    y += rowHeight + gap;
    rowHeight = 0;
  }

  const blockHeight = stickerMm.h + QR_TEXT_BLOCK_MM;

  if (y + blockHeight > pageH - bottom) {
    pdf.addPage(pageSize, pageLayout);
    x = left;
    y = top;
    rowHeight = 0;
  }

  drawStickerImageInPdf(pdf, imgData, x, y, stickerMm, qrType);
  drawQrLabelBelowSticker(pdf, codeText, x, y, stickerMm);

  rowHeight = Math.max(rowHeight, blockHeight);

  return { x: x + stickerMm.w + gap, y, rowHeight };
}

/**
 * Center sticker + label block in printable area (single-page download).
 */
export function computeSinglePageStickerOrigin(pageW, pageH, stickerMm, inset) {
  const { top, bottom, left, right } = normalizePageInsets(inset);
  const blockH = stickerMm.h + QR_TEXT_BLOCK_MM;
  const contentW = stickerMm.w;
  const x = left + Math.max(0, (pageW - left - right - contentW) / 2);
  const y =
    top +
    Math.max(0, (pageH - top - bottom - blockH) / 2);
  return { x, y };
}

function parsePercent(value) {
  if (typeof value === "number") return value;
  return parseFloat(String(value).replace("%", "")) || 0;
}

function overlayMetrics(stickerMm, qrType) {
  const overlay = QR_OVERLAY_LAYOUT[qrType] || QR_OVERLAY_LAYOUT.bike;
  const sizePct = parsePercent(overlay.size) / 100;
  const qrSizeMm = stickerMm.w * sizePct;
  const centerX =
    parsePercent(overlay.left) / 100;
  const centerY =
    parsePercent(overlay.top) / 100;
  return { qrSizeMm, centerX, centerY };
}

async function fetchFrameSvgTemplate(qrType) {
  const url = QR_FRAME_URL[qrType] || QR_FRAME_URL.bike;
  if (!frameSvgTemplateCache.has(url)) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load frame SVG: ${url}`);
    }
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, "image/svg+xml");
    const svg = doc.documentElement;
    if (svg.querySelector("parsererror")) {
      throw new Error(`Invalid frame SVG: ${url}`);
    }
    frameSvgTemplateCache.set(url, svg);
  }
  return frameSvgTemplateCache.get(url).cloneNode(true);
}

/**
 * Build an SVG element for a QR code from a URL string (vector, not PNG).
 */
export async function buildQrSvgElement(qrLink) {
  const svgString = await QRCode.toString(qrLink, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
  });
  const doc = new DOMParser().parseFromString(svgString, "image/svg+xml");
  const svg = doc.documentElement;
  if (svg.querySelector("parsererror")) {
    throw new Error("Invalid QR SVG");
  }
  return svg;
}

/**
 * Draw frame + QR overlay as vector graphics at (xMm, yMm) in mm.
 */
export async function drawVectorSticker(pdf, item, xMm, yMm, stickerMm, qrType) {
  const qrLink = item?.qrLink;
  if (!qrLink) {
    throw new Error("qrLink required for vector sticker");
  }

  const frameSvg = await fetchFrameSvgTemplate(qrType);
  await pdf.svg(frameSvg, {
    x: xMm,
    y: yMm,
    width: stickerMm.w,
    height: stickerMm.h,
  });

  const { qrSizeMm, centerX, centerY } = overlayMetrics(stickerMm, qrType);
  const qrCenterXMm = xMm + stickerMm.w * centerX;
  const qrCenterYMm = yMm + stickerMm.h * centerY;
  const qrX = qrCenterXMm - qrSizeMm / 2;
  const qrY = qrCenterYMm - qrSizeMm / 2;

  const qrSvg = await buildQrSvgElement(qrLink);
  await pdf.svg(qrSvg, {
    x: qrX,
    y: qrY,
    width: qrSizeMm,
    height: qrSizeMm,
  });
}

export async function drawVectorStickerWithLabelBelow(
  pdf,
  item,
  xMm,
  yMm,
  stickerMm,
  qrType,
  codeText
) {
  await drawVectorSticker(pdf, item, xMm, yMm, stickerMm, qrType);
  // drawQrLabelBelowSticker(pdf, codeText, xMm, yMm, stickerMm);
}

/**
 * Batch layout using vector stickers (same pagination as placeStickerOnPage).
 */
export async function placeVectorStickerOnPage(
  pdf,
  item,
  stickerMm,
  cursor,
  pageSize,
  pageLayout,
  codeText,
  qrType,
  pageLayoutMm = PDF_PAGE_INSET_BATCH
) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const { top, bottom, left, right, gap } = normalizePageInsets(pageLayoutMm);

  let { x, y, rowHeight } = cursor;

  if (x + stickerMm.w > pageW - right) {
    x = left;
    y += rowHeight + gap;
    rowHeight = 0;
  }

  const blockHeight = stickerMm.h + QR_TEXT_BLOCK_MM;

  if (y + blockHeight > pageH - bottom) {
    pdf.addPage(pageSize, pageLayout);
    x = left;
    y = top;
    rowHeight = 0;
  }

  await drawVectorSticker(pdf, item, x, y, stickerMm, qrType);
  // drawQrLabelBelowSticker(pdf, codeText, x, y, stickerMm);

  rowHeight = Math.max(rowHeight, blockHeight);

  return { x: x + stickerMm.w + gap, y, rowHeight };
}
