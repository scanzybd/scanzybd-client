import React from "react";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";
import AccountPreferencesPanel from "../../../components/settings/AccountPreferencesPanel";

const UserSettings = () => {
  const { t } = useTranslation();
  const { loading } = useAuth();

  if (loading) {
    return (
      <p className="py-10 text-center text-slate-600 dark:text-slate-300">
        {t("user.settings.loading")}
      </p>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-linear-to-b from-slate-100/80 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t("user.settings.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t("user.settings.subtitle")}
          </p>
        </div>

        <AccountPreferencesPanel translationPrefix="user.settings" />
      </div>
    </div>
  );
};

export default UserSettings;
