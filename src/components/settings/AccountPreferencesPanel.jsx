import React from "react";
import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts/ThemeContext/ThemeContext";
import LanguageSwitcher from "../LanguageSwitcher";

const segmentBtn = (active) =>
  `flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
    active
      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
  }`;

/** Theme, language, read-only email — shared by user + dashboard settings. */
export default function AccountPreferencesPanel({ translationPrefix = "user.settings" }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const tp = (key) => t(`${translationPrefix}.${key}`);

  return (
    <>
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {tp("preferences")}
        </h2>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-800 dark:text-slate-200">{tp("mode")}</p>
          <div
            className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/80"
            role="group"
            aria-label={tp("mode")}
          >
            <button
              type="button"
              className={segmentBtn(theme === "light")}
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4" />
              {tp("modeLight")}
            </button>
            <button
              type="button"
              className={segmentBtn(theme === "dark")}
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4" />
              {tp("modeDark")}
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-800 dark:text-slate-200">{tp("language")}</p>
          <LanguageSwitcher />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {tp("account")}
        </h2>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-200"
            htmlFor="settings-email"
          >
            {tp("email")}
          </label>
          <input
            id="settings-email"
            type="email"
            readOnly
            autoComplete="email"
            value={user?.email ?? ""}
            aria-readonly="true"
            className="input input-bordered w-full cursor-not-allowed border-slate-200 bg-slate-100 text-slate-700 focus:border-slate-300 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tp("emailHint")}</p>
        </div>
      </section>
    </>
  );
}
