import { BRAND_FULL, SITE_TITLE } from "./company";
import { DEFAULT_DESCRIPTION } from "./seo";

/** Static public-route SEO (pathname → meta). Dynamic routes handled in page components. */
export const SEO_ROUTES = {
  "/": {
    title: SITE_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/about": {
    title: `About Us | ${BRAND_FULL}`,
    description:
      "Learn about ScanzyBD — smart QR tags for vehicle safety, instant owner contact, and emergency communication in Bangladesh.",
  },
  "/contact": {
    title: `Contact Us | ${BRAND_FULL}`,
    description:
      "Contact ScanzyBD for orders, support, and business inquiries. We're here to help with smart QR vehicle tags in Bangladesh.",
  },
  "/Products": {
    title: `Shop QR Tags | ${BRAND_FULL}`,
    description:
      "Browse ScanzyBD QR tag packages for bikes and cars. Smart vehicle safety stickers with instant contact and emergency features.",
  },
  "/product": {
    title: `Shop QR Tags | ${BRAND_FULL}`,
    description:
      "Browse ScanzyBD QR tag packages for bikes and cars. Smart vehicle safety stickers with instant contact and emergency features.",
  },
  "/terms-of-use": {
    title: `Terms of Use | ${BRAND_FULL}`,
    description: "Terms of use for the ScanzyBD smart QR vehicle tag service.",
    robots: "index, follow",
  },
  "/privacy-policy": {
    title: `Privacy Policy | ${BRAND_FULL}`,
    description: "How ScanzyBD collects, uses, and protects your personal information.",
  },
  "/refund-policy": {
    title: `Refund Policy | ${BRAND_FULL}`,
    description: "ScanzyBD refund policy — request a refund within 7 days of receiving your order.",
  },
  "/shipping-info": {
    title: `Shipping Information | ${BRAND_FULL}`,
    description: "ScanzyBD shipping and delivery information for QR tag orders across Bangladesh.",
  },
  "/business-terms": {
    title: `Business Terms | ${BRAND_FULL}`,
    description: "Bulk purchase and partnership terms for ScanzyBD business customers.",
  },
  "/faq": {
    title: `FAQ | ${BRAND_FULL}`,
    description:
      "Frequently asked questions about ScanzyBD QR tags — how they work, privacy, and setup.",
  },
  "/blog": {
    title: `Blog | ${BRAND_FULL}`,
    description: `${BRAND_FULL} updates, tips, and news about smart QR vehicle safety.`,
  },
  "/careers": {
    title: `Careers | ${BRAND_FULL}`,
    description: `Join ${BRAND_FULL} and help build smart mobility tools for Bangladesh.`,
  },
  "/partners": {
    title: `Partners | ${BRAND_FULL}`,
    description: "Partner with ScanzyBD for bulk QR tag orders and business solutions.",
  },
  "/help-center": {
    title: `Help Center | ${BRAND_FULL}`,
    description: "Get help with your ScanzyBD QR tag — support guides and contact options.",
  },
  "/documentation": {
    title: `Documentation | ${BRAND_FULL}`,
    description: "ScanzyBD product documentation and setup guides.",
  },
  "/community": {
    title: `Community | ${BRAND_FULL}`,
    description: "Connect with the ScanzyBD community for updates, tips, and user experiences.",
  },
};

export function resolveStaticSeo(pathname) {
  if (SEO_ROUTES[pathname]) return SEO_ROUTES[pathname];

  // Product detail pages set their own meta in ProductPage
  if (/^\/Products\/[^/]+$/i.test(pathname)) return null;

  return SEO_ROUTES["/"];
}
