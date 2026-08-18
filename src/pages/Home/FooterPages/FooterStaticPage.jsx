import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BRAND_FULL,
  COMPANY_LEGAL_NAME,
  COMPANY_NAME,
  PRODUCT_NAME,
} from "../../../config/company";
import {
  cardSurface,
  textHeading,
  textMuted,
  textSubtle,
} from "../../../lib/uiClasses";

function P({ children }) {
  return (
    <p className={`mb-4 text-sm leading-relaxed sm:text-base ${textMuted}`}>
      {children}
    </p>
  );
}

function H3({ children }) {
  return (
    <h3 className={`mb-3 mt-8 text-base font-semibold sm:text-lg ${textHeading}`}>
      {children}
    </h3>
  );
}

const FooterStaticPage = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const key = pathname.replace(/^\//, "").split("/")[0] || "";

  const basicPages = {
    "terms-of-use": { title: t("policies.termsTitle"), body: t("policies.termsBody") },
    "privacy-policy": { title: t("policies.privacyTitle"), body: t("policies.privacyBody") },
    "business-terms": { title: t("policies.businessTitle"), body: t("policies.businessBody") },
    "refund-policy": { title: t("policies.refundTitle"), body: t("policies.refundBody") },
    "shipping-info": { title: t("policies.shippingTitle"), body: t("policies.shippingBody") },
    blog: { title: "Blog", body: `${PRODUCT_NAME} updates and practical tips.` },
    careers: { title: "Careers", body: `Join ${COMPANY_NAME} to build smart mobility tools.` },
    partners: { title: "Partners", body: "Bulk & business partnerships are available." },
    "help-center": { title: "Help Center", body: "For urgent issues, contact support." },
    faq: { title: t("policies.faqTitle"), body: "" },
    documentation: { title: "Documentation", body: "Documentation will be published here." },
    community: {
      title: "Community",
      body: "Stay connected with the ScanzyBD community—get announcements, updates, and real user experiences",
    },
  };
  const page = basicPages[key];
  const faqItems = t("policies.faq", { returnObjects: true });

  if (!page) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-linear-to-b from-amber-50/40 via-slate-50 to-slate-50 text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="app-container py-10 sm:py-14">
        <nav className={`mb-6 text-sm ${textSubtle}`}>
          <Link
            to="/"
            className="transition-colors hover:text-amber-700 dark:hover:text-amber-400"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className={textHeading}>{page.title}</span>
        </nav>
        <article className={`mx-auto max-w-3xl p-6 sm:p-10 ${cardSurface}`}>
          <h1
            className={`mb-6 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl ${textHeading}`}
          >
            {page.title}
          </h1>
          <div className="text-sm sm:text-base">
            <P>{page.body}</P>
            {key === "faq" &&
              Array.isArray(faqItems) &&
              faqItems.map((item) => (
                <div key={item.q}>
                  <H3>{item.q}</H3>
                  <P>{item.a}</P>
                </div>
              ))}
            {(key === "help-center" || key === "business-terms") && (
              <P>
                <Link
                  className="font-medium text-amber-700 underline transition-colors hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                  to="/contact"
                >
                  {t("contactPage.heading")}
                </Link>
              </P>
            )}
          </div>
          <p
            className={`mt-10 border-t border-slate-200 pt-6 text-xs dark:border-slate-700 ${textSubtle}`}
          >
            © {new Date().getFullYear()} {BRAND_FULL} · {COMPANY_LEGAL_NAME}
          </p>
        </article>
      </div>
    </div>
  );
};

export default FooterStaticPage;
