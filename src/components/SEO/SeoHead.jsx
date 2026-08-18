import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_KEYWORDS,
  DEFAULT_SEO,
  GSC_VERIFICATION,
  GA_MEASUREMENT_ID,
  SITE_URL,
  buildCanonical,
} from "../../config/seo";

/**
 * @param {{
 *   title?: string;
 *   description?: string;
 *   keywords?: string;
 *   canonical?: string;
 *   pathname?: string;
 *   image?: string;
 *   imageAlt?: string;
 *   type?: string;
 *   robots?: string;
 *   jsonLd?: object | object[];
 *   noindex?: boolean;
 * }} props
 */
export default function SeoHead({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  pathname = "/",
  image = DEFAULT_SEO.image,
  imageAlt = DEFAULT_SEO.imageAlt,
  type = "website",
  robots,
  jsonLd,
  noindex = false,
}) {
  const { i18n } = useTranslation();
  const lang = i18n.language === "bn" ? "bn" : "en";
  const canonicalUrl = canonical || buildCanonical(pathname);
  const robotsContent = robots || (noindex ? "noindex, nofollow" : "index, follow");

  const schemas = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet prioritizeSeoTags>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      <link rel="alternate" hrefLang="en" href={`${SITE_URL}${pathname === "/" ? "/" : pathname}`} />
      <link rel="alternate" hrefLang="bn" href={`${SITE_URL}${pathname === "/" ? "/" : pathname}`} />
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${pathname === "/" ? "/" : pathname}`} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={DEFAULT_SEO.title.split("|")[0].trim()} />
      <meta property="og:locale" content={lang === "bn" ? "bn_BD" : "en_US"} />
      <meta
        property="og:locale:alternate"
        content={lang === "bn" ? "en_US" : "bn_BD"}
      />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {GSC_VERIFICATION ? (
        <meta name="google-site-verification" content={GSC_VERIFICATION} />
      ) : null}

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}

      {GA_MEASUREMENT_ID ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
          <script>{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}</script>
        </>
      ) : null}
    </Helmet>
  );
}
