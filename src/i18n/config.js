import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import bn from "../locales/bn.json";

const STORAGE_KEY = "appLanguage";

function getInitialLng() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "bn") return stored;
  } catch {
    /* ignore */
  }
  return "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bn: { translation: bn },
  },
  lng: getInitialLng(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng === "bn" ? "bn" : "en";
  }
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language === "bn" ? "bn" : "en";
}

export default i18n;
