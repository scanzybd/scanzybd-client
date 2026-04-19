/**
 * Central branding — override via client `.env` (VITE_*). Rebuild after changes.
 */

function env(key, fallback = "") {
    const v = import.meta.env[key];
    return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

/** Short company / org name (sidebar footer, PDF prefix, etc.) */
export const COMPANY_NAME = env("VITE_COMPANY_NAME", "NYSDTI");

/** Product or app line name */
export const PRODUCT_NAME = env("VITE_PRODUCT_NAME", "QR Tag");

/** Full marketing name, e.g. “ProFast QR Tag System” */
export const BRAND_FULL = env(
    "VITE_BRAND_FULL",
    `ProFast ${PRODUCT_NAME} System`
);

/** Browser tab title */
export const SITE_TITLE = env("VITE_SITE_TITLE", PRODUCT_NAME);

/** Legal entity line (footer, invoices) */
export const COMPANY_LEGAL_NAME = env("VITE_COMPANY_LEGAL_NAME", "ProFast Pvt. Ltd.");

/** Dashboard sidebar subtitle under “Dashboard” */
export const COMPANY_TAGLINE = env("VITE_COMPANY_TAGLINE", "Control panel");

/** Printed QR / “Scan to verify” — defaults to company name */
export const COMPANY_ORG_TITLE = env("VITE_COMPANY_ORG_TITLE", COMPANY_NAME);

/** Long org line on physical QR cards (center / header text) */
export const COMPANY_PRINT_ORG_LINE = env(
    "VITE_COMPANY_PRINT_ORG_LINE",
    "National Youth Skill Development Training Institute"
);

/** Extra footer line after legal name */
export const COMPANY_FOOTER_TAGLINE = env(
    "VITE_COMPANY_FOOTER_TAGLINE",
    "Secure Vehicle Information Management"
);

/** Safe fragment for filenames (PDF exports) */
export function companyNameSlug(name = COMPANY_NAME) {
    const s = String(name).replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return s || "company";
}
