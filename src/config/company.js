/**
 * Central branding — override via client `.env` (VITE_*). Restart dev server after edits.
 *
 * IMPORTANT (Vite): each variable must use a *static* `import.meta.env.VITE_*` reference.
 * Dynamic lookup like `import.meta.env[key]` is not replaced at build time, so .env values were ignored.
 */

function str(value, fallback) {
    if (typeof value === "string" && value.trim()) return value.trim();
    return fallback;
}

/** Short company / org name (sidebar footer, PDF prefix, etc.) */
export const COMPANY_NAME = str(import.meta.env.VITE_COMPANY_NAME, "QR Tag");

/** Product or app line name */
export const PRODUCT_NAME = str(import.meta.env.VITE_PRODUCT_NAME, "QR Tag");

/**
 * Optional CSS color for the header wordmark (hex or rgb(), e.g. #422006).
 * In `.env`, quote hex values: VITE_LOGO_TEXT_COLOR="#422006" — unquoted `#` is parsed as a comment.
 */
export const LOGO_TEXT_COLOR = str(import.meta.env.VITE_LOGO_TEXT_COLOR, "");

/** Full marketing name */
export const BRAND_FULL = str(
    import.meta.env.VITE_BRAND_FULL,
    `${PRODUCT_NAME} System`
);

/** Browser tab title */
export const SITE_TITLE = str(import.meta.env.VITE_SITE_TITLE, "QR Tag | Smart Vehicle Safety & Contact System");

/** Legal entity line (footer, invoices) */
export const COMPANY_LEGAL_NAME = str(
    import.meta.env.VITE_COMPANY_LEGAL_NAME,
    "QR Tag System"
);

/** Dashboard sidebar subtitle under “Dashboard” */
export const COMPANY_TAGLINE = str(
    import.meta.env.VITE_COMPANY_TAGLINE,
    "Scan. Connect. Stay Safe."
);

/** Printed QR / “Scan to verify” — defaults to company name */
export const COMPANY_ORG_TITLE = str(
    import.meta.env.VITE_COMPANY_ORG_TITLE,
    COMPANY_NAME
);

/** Long org line on physical QR cards (center / header text) */
export const COMPANY_PRINT_ORG_LINE = str(
    import.meta.env.VITE_COMPANY_PRINT_ORG_LINE,
    "QR Tag"
);

/** Extra footer line after legal name */
export const COMPANY_FOOTER_TAGLINE = str(
    import.meta.env.VITE_COMPANY_FOOTER_TAGLINE,
    "Smart Safety for Every Vehicle"
);

/** Safe fragment for filenames (PDF exports) */
export function companyNameSlug(name = COMPANY_NAME) {
    const s = String(name).replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return s || "company";
}
