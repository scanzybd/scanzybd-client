import { useTranslation } from "react-i18next";

/**
 * Toggle site language (English / বাংলা). Preference is persisted in localStorage via i18n.
 */
const LanguageSwitcher = ({ className = "" }) => {
  const { i18n, t } = useTranslation();

  const lng = i18n.resolvedLanguage || i18n.language;

  return (
    <div
      className={`join rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
      role="group"
      aria-label={t("common.language")}
    >
      <button
        type="button"
        className={`join-item inline-flex h-7 min-h-0 min-w-[44px] items-center justify-center rounded-md px-2.5 text-[11px] font-medium leading-none transition-colors ${
          lng === "en"
            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        }`}
        onClick={() => i18n.changeLanguage("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={`join-item inline-flex h-7 min-h-0 min-w-[44px] items-center justify-center rounded-md px-2.5 text-[11px] font-medium leading-none transition-colors ${
          lng === "bn"
            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        }`}
        onClick={() => i18n.changeLanguage("bn")}
      >
        বাংলা
      </button>
    </div>
  );
};

export default LanguageSwitcher;
