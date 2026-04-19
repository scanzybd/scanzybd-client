import { useTranslation } from "react-i18next";

/**
 * Toggle site language (English / বাংলা). Preference is persisted in localStorage via i18n.
 */
const LanguageSwitcher = ({ className = "" }) => {
  const { i18n, t } = useTranslation();

  const lng = i18n.resolvedLanguage || i18n.language;

  return (
    <div
      className={`join border border-base-300/80 bg-base-100/90 shadow-sm ${className}`}
      role="group"
      aria-label={t("common.language")}
    >
      <button
        type="button"
        className={`btn btn-xs join-item border-none px-2.5 sm:px-3 ${
          lng === "en" ? "btn-primary text-white" : "btn-ghost"
        }`}
        onClick={() => i18n.changeLanguage("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={`btn btn-xs join-item border-none px-2.5 sm:px-3 ${
          lng === "bn" ? "btn-primary text-white" : "btn-ghost"
        }`}
        onClick={() => i18n.changeLanguage("bn")}
      >
        বাংলা
      </button>
    </div>
  );
};

export default LanguageSwitcher;
