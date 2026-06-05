import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Bike, Box, Car, Loader2, Plus, RefreshCw, Save, Upload } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQrFrameTemplatesAdmin } from "../../../hooks/useQrFrameTemplates";
import { normalizeFrameTemplate } from "../../../lib/qrFrameRuntime";
import QrStickerPreview from "./QrStickerPreview";
import QrPdfPageLayoutPreview from "./QrPdfPageLayoutPreview";

const ICON_OPTIONS = [
  { value: "bike", Icon: Bike },
  { value: "car", Icon: Car },
  { value: "box", Icon: Box },
];

function emptyDraft() {
  return normalizeFrameTemplate({
    slug: "",
    label: "",
    category: "",
    icon: "box",
    svgPath: "",
    overlay: { top: 50, left: 50, size: 30 },
    overlayCss: { top: 50, left: 50, size: 35 },
    frameZoom: 1,
    frameOffsetX: "0%",
    frameOffsetY: "0%",
    stickerMm: { w: 80, h: 45 },
    cardSize: { width: 320, height: 180 },
    pageInset: { top: 6, bottom: 6, left: 4, right: 4, gap: 2 },
    sortOrder: 10,
    isActive: true,
  });
}

function templateToDraft(t) {
  return normalizeFrameTemplate({ ...t, isActive: t.isActive !== false });
}

export default function QrFrameSettings() {
  const { t } = useTranslation();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { data: templates = [], isLoading, refetch } = useQrFrameTemplatesAdmin();

  const [selectedSlug, setSelectedSlug] = useState("");
  const [draft, setDraft] = useState(emptyDraft);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const sortedTemplates = useMemo(
    () => [...templates].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    [templates]
  );

  useEffect(() => {
    if (isNew) return;
    if (!selectedSlug && sortedTemplates.length > 0) {
      setSelectedSlug(sortedTemplates[0].slug);
      return;
    }
    const found = sortedTemplates.find((x) => x.slug === selectedSlug);
    if (found) setDraft(templateToDraft(found));
  }, [sortedTemplates, selectedSlug, isNew]);

  const patchField = (path, value) => {
    setDraft((prev) => {
      const next = { ...prev };
      if (path === "overlay" || path === "overlayCss" || path === "stickerMm" || path === "pageInset") {
        next[path] = { ...prev[path], ...value };
      } else if (path === "cardSize") {
        next.cardSize = { ...prev.cardSize, ...value };
      } else {
        next[path] = value;
      }
      return next;
    });
  };

  const invalidateFrames = () => {
    queryClient.invalidateQueries({ queryKey: ["qr-frame-templates"] });
    queryClient.invalidateQueries({ queryKey: ["qr-frame-templates-admin"] });
  };

  const handleSeed = async () => {
    setSeeding(true);
    setError(null);
    try {
      await axiosSecure.post("/api/qr/frames/admin/seed");
      await refetch();
      invalidateFrames();
      setMessage("Default bike/car templates ensured.");
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        label: draft.label,
        category: draft.category,
        icon: draft.icon,
        svgPath: draft.svgPath,
        overlay: draft.overlay,
        overlayCss: draft.overlayCss,
        frameZoom: draft.frameZoom,
        frameOffsetX: draft.frameOffsetX,
        frameOffsetY: draft.frameOffsetY,
        stickerMm: draft.stickerMm,
        cardSize: draft.cardSize,
        pageInset: draft.pageInset,
        sortOrder: draft.sortOrder,
        isActive: draft.isActive !== false,
      };

      if (isNew) {
        const slug = String(draft.slug || "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "_");
        if (!slug) throw new Error("Slug required (a-z, 0-9, _)");
        await axiosSecure.post("/api/qr/frames/admin", { ...payload, slug });
        setIsNew(false);
        setSelectedSlug(slug);
        setMessage(`Created template "${slug}"`);
      } else {
        await axiosSecure.patch(`/api/qr/frames/admin/${selectedSlug}`, payload);
        setMessage(`Saved "${selectedSlug}"`);
      }
      await refetch();
      invalidateFrames();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSvgUpload = async (file) => {
    if (!file || !selectedSlug || isNew) return;
    setUploading(true);
    setError(null);
    try {
      const text = await file.text();
      if (!text.includes("<svg")) {
        throw new Error("File must be SVG markup");
      }
      await axiosSecure.post(`/api/qr/frames/admin/${selectedSlug}/svg`, {
        svgMarkup: text,
      });
      setMessage("SVG uploaded");
      await refetch();
      invalidateFrames();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setUploading(false);
    }
  };

  const startNew = () => {
    setIsNew(true);
    setSelectedSlug("");
    setDraft(emptyDraft());
  };

  const selectTemplate = (slug) => {
    setIsNew(false);
    setSelectedSlug(slug);
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {t("dashboard.qr.frames.title", "QR frame templates")}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {t(
            "dashboard.qr.frames.subtitle",
            "Upload SVG frames, tune QR overlay and print sizes. New slugs work in Generate QR without code changes."
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-sm gap-2 rounded-xl border border-slate-200"
            disabled={seeding}
            onClick={handleSeed}
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Seed defaults
          </button>
          <button type="button" className="btn btn-sm gap-2 rounded-xl btn-primary" onClick={startNew}>
            <Plus className="h-4 w-4" />
            New template
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Templates</p>
          {isLoading ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
          ) : (
            <ul className="space-y-1">
              {sortedTemplates.map((tm) => (
                <li key={tm.slug}>
                  <button
                    type="button"
                    onClick={() => selectTemplate(tm.slug)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      !isNew && selectedSlug === tm.slug
                        ? "bg-indigo-50 font-semibold text-indigo-900"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {tm.label || tm.slug}
                    <span className="block font-mono text-[10px] text-slate-500">{tm.slug}</span>
                  </button>
                </li>
              ))}
              {isNew && (
                <li className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-900">
                  New template…
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-slate-900">Settings</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {isNew && (
                  <label className="form-control sm:col-span-2">
                    <span className="label-text text-xs">Slug (qrType)</span>
                    <input
                      className="input input-bordered input-sm rounded-lg"
                      value={draft.slug}
                      onChange={(e) => patchField("slug", e.target.value)}
                      placeholder="car_b"
                    />
                  </label>
                )}
                <label className="form-control sm:col-span-2">
                  <span className="label-text text-xs">Label</span>
                  <input
                    className="input input-bordered input-sm rounded-lg"
                    value={draft.label}
                    onChange={(e) => patchField("label", e.target.value)}
                  />
                </label>
                <label className="form-control">
                  <span className="label-text text-xs">Category</span>
                  <input
                    className="input input-bordered input-sm rounded-lg"
                    value={draft.category}
                    onChange={(e) => patchField("category", e.target.value)}
                    placeholder="car"
                  />
                </label>
                <label className="form-control">
                  <span className="label-text text-xs">Icon</span>
                  <select
                    className="select select-bordered select-sm rounded-lg"
                    value={draft.icon}
                    onChange={(e) => patchField("icon", e.target.value)}
                  >
                    {ICON_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.value}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-control sm:col-span-2">
                  <span className="label-text text-xs">Legacy svgPath (optional)</span>
                  <input
                    className="input input-bordered input-sm rounded-lg font-mono text-xs"
                    value={draft.svgPath}
                    onChange={(e) => patchField("svgPath", e.target.value)}
                    placeholder="/qr-frame/car.svg"
                  />
                </label>
              </div>

              <p className="mb-2 mt-4 text-xs font-semibold uppercase text-slate-400">QR overlay %</p>
              <div className="grid grid-cols-3 gap-2">
                {["top", "left", "size"].map((key) => (
                  <label key={key} className="form-control">
                    <span className="label-text text-[10px] capitalize">{key}</span>
                    <input
                      type="number"
                      className="input input-bordered input-sm rounded-lg"
                      value={draft.overlayCss[key]}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        patchField("overlayCss", { [key]: n });
                        patchField("overlay", { [key]: key === "size" ? Math.round(n * 0.85) : n });
                      }}
                    />
                  </label>
                ))}
              </div>

              <p className="mb-2 mt-4 text-xs font-semibold uppercase text-slate-400">Sticker mm</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="form-control">
                  <span className="label-text text-[10px]">Width</span>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-bordered input-sm rounded-lg"
                    value={draft.stickerMm.w}
                    onChange={(e) => patchField("stickerMm", { w: Number(e.target.value) })}
                  />
                </label>
                <label className="form-control">
                  <span className="label-text text-[10px]">Height</span>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-bordered input-sm rounded-lg"
                    value={draft.stickerMm.h}
                    onChange={(e) => patchField("stickerMm", { h: Number(e.target.value) })}
                  />
                </label>
              </div>

              <p className="mb-2 mt-4 text-xs font-semibold uppercase text-slate-400">
                PDF page margin &amp; gap (mm)
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {[
                  { key: "top", label: "Top" },
                  { key: "bottom", label: "Bottom" },
                  { key: "left", label: "Left" },
                  { key: "right", label: "Right" },
                  { key: "gap", label: "Gap" },
                ].map(({ key, label }) => (
                  <label key={key} className="form-control">
                    <span className="label-text text-[10px]">{label}</span>
                    <input
                      type="number"
                      step={key === "gap" ? 0.5 : 1}
                      min={0}
                      className="input input-bordered input-sm rounded-lg"
                      value={draft.pageInset[key]}
                      onChange={(e) => patchField("pageInset", { [key]: Number(e.target.value) })}
                    />
                  </label>
                ))}
              </div>

              <p className="mb-2 mt-4 text-xs font-semibold uppercase text-slate-400">Preview card px</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="form-control">
                  <span className="label-text text-[10px]">Width</span>
                  <input
                    type="number"
                    className="input input-bordered input-sm rounded-lg"
                    value={draft.cardSize.width}
                    onChange={(e) => patchField("cardSize", { width: Number(e.target.value) })}
                  />
                </label>
                <label className="form-control">
                  <span className="label-text text-[10px]">Height</span>
                  <input
                    type="number"
                    className="input input-bordered input-sm rounded-lg"
                    value={draft.cardSize.height}
                    onChange={(e) => patchField("cardSize", { height: Number(e.target.value) })}
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm gap-2 rounded-xl"
                  disabled={saving || (isNew && !draft.slug)}
                  onClick={handleSave}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </button>
                {!isNew && selectedSlug && (
                  <label className="btn btn-sm gap-2 rounded-xl border border-slate-200 cursor-pointer">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload SVG
                    <input
                      type="file"
                      accept=".svg,image/svg+xml"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSvgUpload(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sticker preview
              </p>
              <QrStickerPreview template={draft} />
              <p className="mt-3 font-mono text-[10px] text-slate-500">
                qrType: {isNew ? draft.slug || "—" : selectedSlug}
              </p>
            </div>
          </div>

          <QrPdfPageLayoutPreview template={draft} />
        </div>
      </div>
    </div>
  );
}
