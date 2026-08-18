import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SeoHead from "./SeoHead";
import { BRAND_FULL, COMPANY_NAME } from "../../config/company";
import { SITE_URL, isNoIndexPath } from "../../config/seo";
import { resolveStaticSeo } from "../../config/seoRoutes";

const BASE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: COMPANY_NAME,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/favicon.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: BRAND_FULL,
      url: `${SITE_URL}/`,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

function buildFaqJsonLd(faqItems) {
  if (!Array.isArray(faqItems) || faqItems.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export default function RouteSeo() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const noindex = isNoIndexPath(pathname);

  // Product detail pages manage their own SEO
  if (/^\/Products\/[^/]+$/i.test(pathname)) return null;

  const staticSeo = resolveStaticSeo(pathname);
  const jsonLd = [BASE_JSON_LD];

  if (pathname === "/faq") {
    const faqSchema = buildFaqJsonLd(t("policies.faq", { returnObjects: true }));
    if (faqSchema) jsonLd.push(faqSchema);
  }

  return (
    <SeoHead
      title={staticSeo?.title}
      description={staticSeo?.description}
      pathname={pathname}
      noindex={noindex}
      jsonLd={jsonLd}
    />
  );
}
