import { API_BASE_URL } from "../config/api";
import { LEGACY_QR_FRAMES } from "./qrFrameDefaults";

function pctCss(n) {
  return `${Number(n) || 0}%`;
}

export function normalizeFrameTemplate(raw) {
  const slug = String(raw?.slug || "").trim().toLowerCase();
  const overlay = raw?.overlay || {};
  const overlayCss = raw?.overlayCss || overlay;
  return {
    slug,
    label: String(raw?.label || slug).trim(),
    category: String(raw?.category || "").trim(),
    icon: raw?.icon === "car" || raw?.icon === "bike" ? raw.icon : "box",
    svgPath: String(raw?.svgPath || "").trim(),
    hasSvgMarkup: Boolean(raw?.hasSvgMarkup || String(raw?.svgMarkup || "").trim()),
    overlay: {
      top: Number(overlay.top) || 50,
      left: Number(overlay.left) || 50,
      size: Number(overlay.size) || 30,
    },
    overlayCss: {
      top: Number(overlayCss.top) || 50,
      left: Number(overlayCss.left) || 50,
      size: Number(overlayCss.size) || 35,
    },
    frameZoom: Number(raw?.frameZoom) || 1,
    frameOffsetX: String(raw?.frameOffsetX ?? "0%"),
    frameOffsetY: String(raw?.frameOffsetY ?? "0%"),
    stickerMm: {
      w: Number(raw?.stickerMm?.w) || 80,
      h: Number(raw?.stickerMm?.h) || 45,
    },
    cardSize: {
      width: Number(raw?.cardSize?.width) || 200,
      height: Number(raw?.cardSize?.height) || 180,
    },
    pageInset: {
      top: Number(raw?.pageInset?.top) ?? 6,
      bottom: Number(raw?.pageInset?.bottom) ?? 6,
      left: Number(raw?.pageInset?.left) ?? 4,
      right: Number(raw?.pageInset?.right) ?? 4,
      gap: Number(raw?.pageInset?.gap) ?? 2,
    },
    sortOrder: Number(raw?.sortOrder) || 0,
  };
}

export function buildFrameCatalog(templates) {
  const list = (Array.isArray(templates) && templates.length ? templates : LEGACY_QR_FRAMES).map(
    normalizeFrameTemplate
  );
  const bySlug = {};
  for (const t of list) {
    if (t.slug) bySlug[t.slug] = t;
  }
  return { list, bySlug };
}

export function getFrameTemplate(catalog, slug) {
  const s = String(slug || "").trim().toLowerCase();
  return catalog?.bySlug?.[s] || catalog?.list?.[0] || normalizeFrameTemplate(LEGACY_QR_FRAMES[0]);
}

export function resolveFrameSvgUrl(template) {
  if (!template) return "/qr-frame/bike.svg";
  if (template.hasSvgMarkup) {
    return `${API_BASE_URL}/api/qr/frames/${encodeURIComponent(template.slug)}/svg`;
  }
  if (template.svgPath) {
    if (/^https?:\/\//i.test(template.svgPath)) return template.svgPath;
    return template.svgPath;
  }
  return `${API_BASE_URL}/api/qr/frames/${encodeURIComponent(template.slug)}/svg`;
}

export function overlayCssStyle(template) {
  const o = template?.overlayCss || template?.overlay || {};
  return {
    top: pctCss(o.top),
    left: pctCss(o.left),
    size: pctCss(o.size),
  };
}

/** Global PDF fallback when template has no pageInset. */
export const DEFAULT_PAGE_INSET = {
  top: 6,
  bottom: 6,
  left: 4,
  right: 4,
  gap: 2,
};

export function resolvePageInset(template) {
  return {
    ...DEFAULT_PAGE_INSET,
    ...(template?.pageInset || {}),
  };
}
