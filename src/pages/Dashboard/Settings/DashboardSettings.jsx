import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CreditCard, QrCode, Save } from "lucide-react";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";
import AccountPreferencesPanel from "../../../components/settings/AccountPreferencesPanel";

function validatePaymentForm(form) {
  const method = form.preferredMethod;
  if (method === "bkash" && !form.bkashNumber.trim()) {
    return "bKash number is required";
  }
  if (method === "bank") {
    if (!form.bankName.trim()) return "Bank name is required";
    if (!form.accountHolder.trim()) return "Account holder is required";
    if (!form.accountNumber.trim()) return "Account number is required";
  }
  if (method === "cash" && !form.moneyReceiptNo.trim()) {
    return "Money receipt number is required";
  }
  return null;
}

const emptyPaymentForm = {
  bkashNumber: "",
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  moneyReceiptNo: "",
  preferredMethod: "bkash",
  note: "",
};

export default function DashboardSettings() {
  const { t } = useTranslation();
  const { userRole, loading } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const isAdmin = userRole === "admin";
  const isProvider = userRole === "provider";

  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  const { data: paymentData, isLoading: loadingPayment } = useQuery({
    queryKey: ["provider-payment-details"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/finance/provider/payment-details");
      return res.data?.profile;
    },
    enabled: isProvider,
  });

  useEffect(() => {
    if (!paymentData) return;
    setPaymentForm({
      bkashNumber: paymentData.bkashNumber || "",
      bankName: paymentData.bankName || "",
      accountHolder: paymentData.accountHolder || "",
      accountNumber: paymentData.accountNumber || "",
      moneyReceiptNo: paymentData.moneyReceiptNo || "",
      preferredMethod: paymentData.preferredMethod || "bkash",
      note: paymentData.note || "",
    });
  }, [paymentData]);

  const savePaymentMutation = useMutation({
    mutationFn: () => axiosSecure.put("/api/finance/provider/payment-details", paymentForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-payment-details"] });
      Swal.fire("Saved", t("dashboard.settings.provider.paymentSaved"), "success");
    },
    onError: (err) => {
      Swal.fire("Failed", err?.response?.data?.message || "Could not save", "error");
    },
  });

  const handleSavePayment = () => {
    const err = validatePaymentForm(paymentForm);
    if (err) {
      Swal.fire("Required", err, "warning");
      return;
    }
    savePaymentMutation.mutate();
  };

  if (loading) {
    return <SmartLoader fullPage label={t("dashboard.settings.loading")} />;
  }

  const payMethod = paymentForm.preferredMethod;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t("dashboard.settings.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {isAdmin
            ? t("dashboard.settings.subtitleAdmin")
            : isProvider
              ? t("dashboard.settings.subtitleProvider")
              : t("dashboard.settings.subtitle")}
        </p>
      </div>

      <AccountPreferencesPanel translationPrefix="dashboard.settings" />

      {isProvider ? (
        <section className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/90">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
            {t("dashboard.settings.provider.payoutTitle")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("dashboard.settings.provider.payoutHint")}
          </p>

          {loadingPayment ? (
            <p className="text-sm text-slate-500">{t("dashboard.settings.loading")}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="text-slate-600 dark:text-slate-400">
                  {t("dashboard.settings.provider.method")}
                </span>
                <select
                  className="select select-bordered select-sm mt-1 w-full rounded-lg"
                  value={paymentForm.preferredMethod}
                  onChange={(e) =>
                    setPaymentForm((f) => ({ ...f, preferredMethod: e.target.value }))
                  }
                >
                  <option value="bkash">bKash</option>
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                </select>
              </label>

              {payMethod === "bkash" ? (
                <label className="block text-sm sm:col-span-2">
                  <span className="text-slate-600 dark:text-slate-400">bKash number</span>
                  <input
                    className="input input-bordered input-sm mt-1 w-full rounded-lg"
                    value={paymentForm.bkashNumber}
                    onChange={(e) =>
                      setPaymentForm((f) => ({ ...f, bkashNumber: e.target.value }))
                    }
                  />
                </label>
              ) : null}

              {payMethod === "bank" ? (
                <>
                  <label className="block text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Bank name</span>
                    <input
                      className="input input-bordered input-sm mt-1 w-full rounded-lg"
                      value={paymentForm.bankName}
                      onChange={(e) =>
                        setPaymentForm((f) => ({ ...f, bankName: e.target.value }))
                      }
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Account holder</span>
                    <input
                      className="input input-bordered input-sm mt-1 w-full rounded-lg"
                      value={paymentForm.accountHolder}
                      onChange={(e) =>
                        setPaymentForm((f) => ({ ...f, accountHolder: e.target.value }))
                      }
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-slate-600 dark:text-slate-400">Account number</span>
                    <input
                      className="input input-bordered input-sm mt-1 w-full rounded-lg"
                      value={paymentForm.accountNumber}
                      onChange={(e) =>
                        setPaymentForm((f) => ({ ...f, accountNumber: e.target.value }))
                      }
                    />
                  </label>
                </>
              ) : null}

              {payMethod === "cash" ? (
                <label className="block text-sm sm:col-span-2">
                  <span className="text-slate-600 dark:text-slate-400">Money receipt no.</span>
                  <input
                    className="input input-bordered input-sm mt-1 w-full rounded-lg"
                    value={paymentForm.moneyReceiptNo}
                    onChange={(e) =>
                      setPaymentForm((f) => ({ ...f, moneyReceiptNo: e.target.value }))
                    }
                  />
                </label>
              ) : null}

              <label className="block text-sm sm:col-span-2">
                <span className="text-slate-600 dark:text-slate-400">Note (optional)</span>
                <textarea
                  className="textarea textarea-bordered textarea-sm mt-1 w-full rounded-lg"
                  rows={2}
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, note: e.target.value }))}
                />
              </label>

              <button
                type="button"
                className="btn btn-primary btn-sm gap-2 rounded-xl sm:col-span-2"
                disabled={savePaymentMutation.isPending}
                onClick={handleSavePayment}
              >
                <Save className="h-4 w-4" />
                {t("dashboard.settings.provider.savePayout")}
              </button>
            </div>
          )}
        </section>
      ) : null}

      {isAdmin ? (
        <section className="space-y-3 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm dark:border-violet-900/40 dark:bg-slate-900/90">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-800 dark:text-violet-300">
            {t("dashboard.settings.admin.workspaceTitle")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("dashboard.settings.admin.workspaceHint")}
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/dashboard/payment-gateways"
              className="btn btn-outline btn-sm justify-start gap-2 rounded-xl"
            >
              <CreditCard className="h-4 w-4" />
              {t("dashboard.menu.paymentGateways")}
            </Link>
            <Link
              to="/dashboard/qr-frame-settings"
              className="btn btn-outline btn-sm justify-start gap-2 rounded-xl"
            >
              <QrCode className="h-4 w-4" />
              {t("dashboard.menu.qrFrameSettings")}
            </Link>
            <Link
              to="/dashboard/provider-due-list"
              className="btn btn-outline btn-sm justify-start gap-2 rounded-xl"
            >
              <Building2 className="h-4 w-4" />
              {t("dashboard.menu.providerDue")}
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
