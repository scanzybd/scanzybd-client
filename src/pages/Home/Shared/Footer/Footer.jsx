import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import { FaTiktok } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import footerLogo from "../../../../assets/logo/Logo Double Line.svg";
import {
  BRAND_FULL,
  COMPANY_FOOTER_TAGLINE,
  COMPANY_LEGAL_NAME,
  COMPANY_PRINT_ORG_LINE,
} from '../../../../config/company';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Terms of Use', to: '/terms-of-use' },
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Blog', to: '/blog' },
  ];

  const companyLinks = [
    { label: 'Business Terms', to: '/business-terms' },
    { label: 'Refund Policy', to: '/refund-policy' },
    { label: 'Shipping Info', to: '/shipping-info' },
    { label: 'Careers', to: '/careers' },
    { label: 'Partners', to: '/partners' },
  ];

  const supportLinks = [
    { label: 'Help Center', to: '/help-center' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Documentation', to: '/documentation' },
    { label: 'Community', to: '/community' },
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
    { icon: Instagram, label: 'Instagram', href: 'https://youtube.com' },
    { icon: FaTiktok, label: 'TikTok', href: 'https://tiktok.com' },  ];

  return (
    <footer className="mt-16 w-full border-t-2 border-slate-200 bg-linear-to-b from-slate-100 via-white to-slate-100 pt-16 text-slate-800 transition-colors dark:border-slate-700 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:text-slate-100 sm:mt-20 sm:pt-20">
      {/* CTA Section */}
      <div className="app-container pb-16 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-2xl bg-linear-to-r from-amber-300 to-amber-400 shadow-xl ring-1 ring-amber-600/15 dark:from-amber-400 dark:to-amber-500 dark:ring-amber-700/25">
            <div className="px-6 py-8 sm:px-8 sm:py-12 md:px-12 md:py-16">
              <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
                <div>
                  <h2 className="mb-4 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl md:text-4xl">
                    {t("footer.ctaTitle")}
                  </h2>
                  <p className="mb-2 text-lg text-slate-800/90">
                    {t("footer.ctaSubtitle")}
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row md:justify-end">
                  <Link
                    to="/product"
                    className="inline-flex transform items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-bold text-amber-300 transition hover:scale-105 hover:bg-slate-800 sm:px-8 sm:py-4"
                  >
                    {t("footer.ctaButton")}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="app-container py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 mb-12 sm:mb-16">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <img
                src={footerLogo}
                alt={BRAND_FULL}
                className="mb-4 h-10 w-auto object-contain sm:h-12"
                draggable={false}
              />
              <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {COMPANY_FOOTER_TAGLINE}
              </p>
              <p className="mb-6 text-xs leading-relaxed text-slate-500 dark:text-slate-500">
                {COMPANY_PRINT_ORG_LINE}
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4">
                {socialLinks.map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={idx}
                      href={social.href}
                      aria-label={social.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 transition hover:scale-110 hover:bg-amber-500 dark:bg-slate-700"
                    >
                      <Icon className="w-5 h-5 text-amber-400" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">{t("footer.quickLinks")}</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center text-sm text-slate-600 transition hover:text-amber-600 dark:text-slate-400 dark:hover:text-yellow-400"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2 group-hover:translate-x-1 transition"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">{t("footer.company")}</h3>
              <ul className="space-y-3">
                {companyLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center text-sm text-slate-600 transition hover:text-amber-600 dark:text-slate-400 dark:hover:text-yellow-400"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2 group-hover:translate-x-1 transition"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">{t("footer.support")}</h3>
              <ul className="space-y-3">
                {supportLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center text-sm text-slate-600 transition hover:text-amber-600 dark:text-slate-400 dark:hover:text-yellow-400"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2 group-hover:translate-x-1 transition"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">{t("footer.contact")}</h3>
              <div className="space-y-4">
                
                <a href={`mailto:${t("contactPage.email")}`} className="group flex items-start gap-3 text-sm text-slate-600 transition hover:text-amber-600 dark:text-slate-400 dark:hover:text-yellow-400">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 group-hover:text-yellow-400" />
                  <span>{t("contactPage.email")}</span>
                </a>
                <div className="group flex items-start gap-3 text-sm text-slate-600 transition hover:text-amber-600 dark:text-slate-400 dark:hover:text-yellow-400">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 group-hover:text-yellow-400" />
                  <div>
                    <div>{t("contactPage.address1")}</div>
                    <div>{t("contactPage.address2")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-8 h-px bg-linear-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700"></div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-center text-sm text-slate-600 dark:text-slate-400 md:text-left">
              <p>© {currentYear} {BRAND_FULL}. {t("footer.copyright")}.</p>
              <p className="mt-2">
                {COMPANY_LEGAL_NAME} | {t("footer.extraNote")}
              </p>
            </div>

            {/* Download Buttons */}
           
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;