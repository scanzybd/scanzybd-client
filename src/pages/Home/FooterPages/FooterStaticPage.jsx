import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BRAND_FULL,
  COMPANY_LEGAL_NAME,
  COMPANY_NAME,
  PRODUCT_NAME,
} from "../../../config/company";

function P({ children }) {
  return <p className="mb-4 text-slate-600 leading-relaxed">{children}</p>;
}

function H3({ children }) {
  return (
    <h3 className="mb-3 mt-8 text-lg font-semibold text-slate-900">{children}</h3>
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
    community: { title: "Community", body: "Community announcements and updates." },
  };
  const page = basicPages[key];
  const faqItems = t("policies.faq", { returnObjects: true });

  if (!page) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-[60vh] bg-linear-to-b from-yellow-50/40 to-white">
      <div className="app-container py-10 sm:py-14">
        <nav className="mb-6 text-sm text-slate-500">
          <Link to="/" className="hover:text-amber-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{page.title}</span>
        </nav>
        <article className="mx-auto max-w-3xl rounded-2xl border border-yellow-100 bg-white/90 p-6 shadow-sm sm:p-10">
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-yellow-950 sm:text-4xl">
            {page.title}
          </h1>
          <div className="text-base">
            <P>{page.body}</P>
            {key === "faq" && Array.isArray(faqItems) && faqItems.map((item) => (
              <div key={item.q}>
                <H3>{item.q}</H3>
                <P>{item.a}</P>
              </div>
            ))}
            {(key === "help-center" || key === "business-terms") && (
              <P>
                <Link className="font-medium text-amber-700 underline" to="/contact">
                  {t("contactPage.heading")}
                </Link>
              </P>
            )}
          </div>
          <p className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">
            © {new Date().getFullYear()} {BRAND_FULL} · {COMPANY_LEGAL_NAME}
          </p>
        </article>
      </div>
    </div>
  );
};

export default FooterStaticPage;
