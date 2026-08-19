import React, { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, MonitorSmartphone, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

function formatWhen(value, locale) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(locale === "bn" ? "bn-BD" : undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ActiveSessionsPanel() {
  const { t, i18n } = useTranslation();
  const { logOut } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["auth-sessions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/auth/sessions");
      return Array.isArray(res.data?.sessions) ? res.data.sessions : [];
    },
  });

  const sessions = useMemo(() => data || [], [data]);

  const revokeMutation = useMutation({
    mutationFn: async (sessionId) => {
      const res = await axiosSecure.delete(`/api/auth/sessions/${sessionId}`);
      return res.data;
    },
    onSuccess: async (payload) => {
      await queryClient.invalidateQueries({ queryKey: ["auth-sessions"] });
      if (payload?.revokedCurrent) {
        await logOut({ remote: true });
        return;
      }
      Swal.fire({
        icon: "success",
        title: t("dashboard.settings.sessions.revokedTitle"),
        text: t("dashboard.settings.sessions.revokedText"),
        timer: 1800,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire(
        "Failed",
        err?.response?.data?.message || t("dashboard.settings.sessions.revokeFailed"),
        "error"
      );
    },
  });

  const confirmRevoke = async (session) => {
    if (!session?.sessionId) return;
    const result = await Swal.fire({
      icon: "warning",
      title: t("dashboard.settings.sessions.confirmTitle"),
      text: session.isCurrent
        ? t("dashboard.settings.sessions.confirmCurrent")
        : t("dashboard.settings.sessions.confirmOther", { device: session.label }),
      showCancelButton: true,
      confirmButtonText: t("dashboard.settings.sessions.confirmYes"),
      cancelButtonText: t("dashboard.settings.sessions.confirmCancel"),
    });
    if (!result.isConfirmed) return;
    revokeMutation.mutate(session.sessionId);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-sky-100 bg-white p-6 shadow-sm dark:border-sky-900/40 dark:bg-slate-900/90">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-300">
            {t("dashboard.settings.sessions.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t("dashboard.settings.sessions.hint")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn btn-ghost btn-sm gap-2 rounded-xl"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          {t("dashboard.settings.sessions.refresh")}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">{t("dashboard.settings.loading")}</p>
      ) : isError ? (
        <p className="text-sm text-rose-600 dark:text-rose-400">
          {t("dashboard.settings.sessions.loadFailed")}
        </p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-slate-500">{t("dashboard.settings.sessions.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li
              key={session.sessionId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/70"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <MonitorSmartphone className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {session.label || t("dashboard.settings.sessions.unknownDevice")}
                  </p>
                  {session.isCurrent ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                      {t("dashboard.settings.sessions.currentDevice")}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t("dashboard.settings.sessions.lastActive")}:{" "}
                  {formatWhen(session.lastSeenAt, i18n.language)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("dashboard.settings.sessions.signedIn")}:{" "}
                  {formatWhen(session.createdAt, i18n.language)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => confirmRevoke(session)}
                disabled={revokeMutation.isPending}
                className="btn btn-outline btn-sm gap-2 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/30"
              >
                <LogOut className="h-4 w-4" />
                {session.isCurrent
                  ? t("dashboard.settings.sessions.logoutHere")
                  : t("dashboard.settings.sessions.logoutDevice")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
