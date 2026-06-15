import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Phone, Save } from "lucide-react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { DEFAULT_CONTACT_INFO } from "../../lib/contactInfoConfig";

function emptyForm() {
  return { ...DEFAULT_CONTACT_INFO };
}

function phoneDigitsOnly(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 11);
}

export default function ContactInfoControlPanel() {
  const { t } = useTranslation();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["contact-info-admin"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/settings/admin/contact");
      return res.data?.contact;
    },
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      phone: data.phone || "",
      phoneEnabled: data.phoneEnabled !== false,
      whatsapp: data.whatsapp || "",
      whatsappEnabled: Boolean(data.whatsappEnabled),
      email: data.email || "",
      addressLine1: data.addressLine1 || "",
      addressLine2: data.addressLine2 || "",
      businessHours: data.businessHours || "",
    });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => axiosSecure.put("/api/settings/admin/contact", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-info-admin"] });
      queryClient.invalidateQueries({ queryKey: ["contact-info-public"] });
      Swal.fire("Saved", t("dashboard.settings.admin.contactSaved"), "success");
    },
    onError: (err) => {
      Swal.fire("Failed", err?.response?.data?.message || "Could not save", "error");
    },
  });

  const patch = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="space-y-4 rounded-2xl border border-teal-100 bg-white p-6 shadow-sm dark:border-teal-900/40 dark:bg-slate-900/90">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-300">
        <Phone className="h-4 w-4" />
        {t("dashboard.settings.admin.contactTitle")}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {t("dashboard.settings.admin.contactHint")}
      </p>

      {isLoading ? (
        <p className="text-sm text-slate-500">{t("dashboard.settings.loading")}</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t("dashboard.settings.admin.contactPhone")}
              </span>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={form.phoneEnabled}
                  onChange={(e) => patch("phoneEnabled", e.target.checked)}
                />
                {t("dashboard.settings.admin.contactShowOnSite")}
              </label>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              className="input input-bordered input-sm w-full rounded-lg font-mono text-sm"
              placeholder="01850000000"
              value={form.phone}
              onChange={(e) => patch("phone", phoneDigitsOnly(e.target.value))}
            />
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                WhatsApp
              </span>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={form.whatsappEnabled}
                  onChange={(e) => patch("whatsappEnabled", e.target.checked)}
                />
                {t("dashboard.settings.admin.contactShowOnSite")}
              </label>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              className="input input-bordered input-sm w-full rounded-lg font-mono text-sm"
              placeholder="01850000000"
              value={form.whatsapp}
              onChange={(e) => patch("whatsapp", phoneDigitsOnly(e.target.value))}
            />
          </div>

          <label className="block text-sm">
            <span className="text-slate-600 dark:text-slate-400">Email</span>
            <input
              type="email"
              className="input input-bordered input-sm mt-1 w-full rounded-lg"
              value={form.email}
              onChange={(e) => patch("email", e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              {t("dashboard.settings.admin.contactAddress1")}
            </span>
            <input
              className="input input-bordered input-sm mt-1 w-full rounded-lg"
              value={form.addressLine1}
              onChange={(e) => patch("addressLine1", e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              {t("dashboard.settings.admin.contactAddress2")}
            </span>
            <input
              className="input input-bordered input-sm mt-1 w-full rounded-lg"
              value={form.addressLine2}
              onChange={(e) => patch("addressLine2", e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              {t("dashboard.settings.admin.contactHours")}
            </span>
            <input
              className="input input-bordered input-sm mt-1 w-full rounded-lg"
              value={form.businessHours}
              onChange={(e) => patch("businessHours", e.target.value)}
            />
          </label>

          <button
            type="button"
            className="btn btn-primary btn-sm gap-2 rounded-xl"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            <Save className="h-4 w-4" />
            {t("dashboard.settings.admin.contactSave")}
          </button>
        </div>
      )}
    </section>
  );
}
