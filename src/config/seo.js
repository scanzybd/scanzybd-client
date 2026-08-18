import {
  BRAND_FULL,
  COMPANY_NAME,
  COMPANY_TAGLINE,
  SITE_TITLE,
} from "./company";

function str(value, fallback) {
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}

export const SITE_URL = str(import.meta.env.VITE_SITE_URL, "https://scanzybd.com").replace(
  /\/$/,
  ""
);

export const OG_IMAGE = `${SITE_URL}/preview.png`;

export const DEFAULT_DESCRIPTION =
  "ScanzyBD provides smart QR code tags for vehicles in Bangladesh. Ensure safety, quick identification, and emergency contact with innovative QR solutions.";

export const DEFAULT_KEYWORDS =
  "QR code tag Bangladesh, vehicle QR tag, smart QR sticker BD, emergency contact QR, car safety Bangladesh";

export const GA_MEASUREMENT_ID = str(import.meta.env.VITE_GA_MEASUREMENT_ID, "");
export const GSC_VERIFICATION = str(import.meta.env.VITE_GSC_VERIFICATION, "");

export const DEFAULT_SEO = {
  title: SITE_TITLE,
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  image: OG_IMAGE,
  imageAlt: `${COMPANY_NAME} — ${COMPANY_TAGLINE}`,
  type: "website",
};

/** Paths that should never be indexed */
export const NOINDEX_PATH_PREFIXES = [
  "/dashboard",
  "/user",
  "/login",
  "/register",
  "/forgotPassword",
  "/payment",
  "/qr-landing",
];

export function buildCanonical(pathname = "/") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.replace(/\/+$/, "") || "/"}`;
}

export function isNoIndexPath(pathname = "") {
  return NOINDEX_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function absoluteUrl(path = "") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
