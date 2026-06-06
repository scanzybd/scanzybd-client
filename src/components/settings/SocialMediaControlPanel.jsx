import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Share2 } from "lucide-react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { DEFAULT_SOCIAL_LINKS, SOCIAL_PLATFORMS } from "../../lib/socialMediaConfig";

function emptyForm() {
  const out = {};
  for (const p of SOCIAL_PLATFORMS) {
    out[p.id] = {
      url: DEFAULT_SOCIAL_LINKS[p.id]?.url || "",
      enabled: DEFAULT_SOCIAL_LINKS[p.id]?.enabled ?? false,
    };
  }
  return out;
}

export default function SocialMediaControlPanel() {
  const { t } = useTranslation();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["social-media-admin"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/settings/admin/social-media");
      return res.data?.social;
    },
  });

  useEffect(() => {
    if (!data) return;
    const next = emptyForm();
    for (const p of SOCIAL_PLATFORMS) {
      next[p.id] = {
        url: data[p.id]?.url || "",
        enabled: data[p.id]?.enabled !== false,
      };
    }
    setForm(next);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => axiosSecure.put("/api/settings/admin/social-media", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media-admin"] });
      queryClient.invalidateQueries({ queryKey: ["social-media-public"] });
      Swal.fire("Saved", t("dashboard.settings.admin.socialSaved"), "success");
    },
    onError: (err) => {
      Swal.fire("Failed", err?.response?.data?.message || "Could not save", "error");
    },
  });

  const patchPlatform = (id, patch) => {
    setForm((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  };

  return (
    <section className="space-y-4 rounded-2xl border border-sky-100 bg-white p-6 shadow-sm dark:border-sky-900/40 dark:bg-slate-900/90">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-300">
        <Share2 className="h-4 w-4" />
        {t("dashboard.settings.admin.socialTitle")}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {t("dashboard.settings.admin.socialHint")}
      </p>

      {isLoading ? (
        <p className="text-sm text-slate-500">{t("dashboard.settings.loading")}</p>
      ) : (
        <div className="space-y-4">
          {SOCIAL_PLATFORMS.map((p) => {
            const Icon = p.Icon;
            const row = form[p.id] || { url: "", enabled: false };
            return (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <Icon className="h-4 w-4 text-amber-500" />
                    {p.label}
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={row.enabled}
                      onChange={(e) => patchPlatform(p.id, { enabled: e.target.checked })}
                    />
                    {t("dashboard.settings.admin.socialShowInFooter")}
                  </label>
                </div>
                <input
                  type="url"
                  className="input input-bordered input-sm w-full rounded-lg font-mono text-xs"
                  placeholder={`https://${p.id}.com/...`}
                  value={row.url}
                  onChange={(e) => patchPlatform(p.id, { url: e.target.value })}
                />
              </div>
            );
          })}

          <button
            type="button"
            className="btn btn-primary btn-sm gap-2 rounded-xl"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            <Save className="h-4 w-4" />
            {t("dashboard.settings.admin.socialSave")}
          </button>
        </div>
      )}
    </section>
  );
}
