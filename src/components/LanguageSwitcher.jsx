import { useTranslation } from "react-i18next";

const langBtn = (active) =>
  `inline-flex shrink-0 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    active
      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
  }`;

/**
 * Toggle site language (English / বাংলা). Preference is persisted in localStorage via i18n.
 */
const LanguageSwitcher = ({ className = "" }) => {
  const { i18n, t } = useTranslation();

  const lng = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

  return (
    <div
      className={`inline-flex w-fit gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/80 ${className}`}
      role="group"
      aria-label={t("common.language")}
    >
      <button
        type="button"
        className={langBtn(lng === "en")}
        onClick={() => i18n.changeLanguage("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={langBtn(lng === "bn")}
        onClick={() => i18n.changeLanguage("bn")}
      >
        বাংলা
      </button>
    </div>
  );
};

export default LanguageSwitcher;
