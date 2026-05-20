import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { jsPDF } from "jspdf";
import {
  QrCode,
  Filter,
  RotateCcw,
  BarChart3,
  Bike,
  Car,
  ScanLine,
  Link2,
  CheckCircle2,
  CircleDashed,
  CalendarDays,
  Eye,
  FileDown,
  Loader2,
} from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";
import {
  CARD_SIZE,
  getStickerSizeMm,
  PDF_PAGE_INSET_BATCH,
  placeVectorStickerOnPage,
  QR_FRAME_URL,
} from "./qrStickerPdf";

const QR_FRAME_ASSET = QR_FRAME_URL;

const QR_OVERLAY_LAYOUT = {
  bike: { top: "50%", left: "26%", size: "35%" },
  car: { top: "40%", left: "50%", size: "65%" },
};

const FRAME_ZOOM_LAYOUT = {
  bike: 1,
  car: 1,
};

const FRAME_OFFSET_LAYOUT = {
  bike: { x: "0%", y: "0%" },
  car: { x: "0%", y: "0%" },
};

const LIST_PREVIEW_SCALE = {
  bike: 0.48,
  car: 0.35,
};

const LIST_PREVIEW_HEIGHT = {
  bike: 124,
  car: 190,
};

const PAGE_FORMATS = [
  { label: "A0", value: "a0", w: 841, h: 1189 },
  { label: "A1", value: "a1", w: 594, h: 841 },
  { label: "A2", value: "a2", w: 420, h: 594 },
  { label: "A3", value: "a3", w: 297, h: 420 },
  { label: "A4", value: "a4", w: 210, h: 297 },
  { label: "A5", value: "a5", w: 148, h: 210 },
  { label: "A6", value: "a6", w: 105, h: 148 },
  { label: "A7", value: "a7", w: 74, h: 105 },
  { label: "A8", value: "a8", w: 52, h: 74 },
  { label: "A9", value: "a9", w: 37, h: 52 },
  { label: "A10", value: "a10", w: 26, h: 37 },
  { label: "B0", value: "b0", w: 1000, h: 1414 },
  { label: "B1", value: "b1", w: 707, h: 1000 },
  { label: "B2", value: "b2", w: 500, h: 707 },
  { label: "B3", value: "b3", w: 353, h: 500 },
  { label: "B4", value: "b4", w: 250, h: 353 },
  { label: "B5", value: "b5", w: 176, h: 250 },
  { label: "B6", value: "b6", w: 125, h: 176 },
  { label: "B7", value: "b7", w: 88, h: 125 },
  { label: "B8", value: "b8", w: 62, h: 88 },
  { label: "B9", value: "b9", w: 44, h: 62 },
  { label: "B10", value: "b10", w: 31, h: 44 },
  { label: "C0", value: "c0", w: 917, h: 1297 },
  { label: "C1", value: "c1", w: 648, h: 917 },
  { label: "C2", value: "c2", w: 458, h: 648 },
  { label: "C3", value: "c3", w: 324, h: 458 },
  { label: "C4", value: "c4", w: 229, h: 324 },
  { label: "C5", value: "c5", w: 162, h: 229 },
  { label: "C6", value: "c6", w: 114, h: 162 },
  { label: "C7", value: "c7", w: 81, h: 114 },
  { label: "C8", value: "c8", w: 57, h: 81 },
  { label: "C9", value: "c9", w: 40, h: 57 },
  { label: "C10", value: "c10", w: 28, h: 40 },
  { label: "DL", value: "dl", w: 110, h: 220 },
  { label: "Letter", value: "letter", w: 216, h: 279 },
  { label: "Government-Letter", value: "government-letter", w: 203, h: 267 },
  { label: "Legal", value: "legal", w: 216, h: 356 },
  { label: "Junior-Legal", value: "junior-legal", w: 127, h: 203 },
  { label: "Ledger", value: "ledger", w: 432, h: 279 },
  { label: "Tabloid", value: "tabloid", w: 279, h: 432 },
  { label: "Credit Card", value: "credit-card", w: 54, h: 86 },
  { label: "Custom", value: "custom", w: 148, h: 210 }, // default values for Custom
];

const PAGE_ORIENTATIONS = [
  { label: "Portrait", value: "p" },
  { label: "Landscape", value: "l" },
];

function StickerFramePreview({ qrCode, qrType }) {
  const frameSrc = QR_FRAME_ASSET[qrType] || QR_FRAME_ASSET.bike;
  const overlay = QR_OVERLAY_LAYOUT[qrType] || QR_OVERLAY_LAYOUT.bike;
  const frameZoom = FRAME_ZOOM_LAYOUT[qrType] || FRAME_ZOOM_LAYOUT.bike;
  const frameOffset = FRAME_OFFSET_LAYOUT[qrType] || FRAME_OFFSET_LAYOUT.bike;
  const size = CARD_SIZE[qrType] || CARD_SIZE.bike;

  return (
    <div
      className="relative overflow-hidden bg-white"
      style={{ width: size.width, height: size.height }}
    >
      <img
        src={frameSrc}
        alt=""
        className="absolute left-1/2 top-1/2 h-full w-full object-contain"
        style={{
          left: `calc(50% + ${frameOffset.x})`,
          top: `calc(50% + ${frameOffset.y})`,
          transform: `translate(-50%, -50%) scale(${frameZoom})`,
          transformOrigin: "center center",
        }}
        crossOrigin="anonymous"
        draggable={false}
      />
      <img
        src={qrCode}
        alt=""
        className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"
        style={{ top: overlay.top, left: overlay.left, width: overlay.size }}
        crossOrigin="anonymous"
        draggable={false}
      />
    </div>
  );
}

function daysInMonth(yearStr, monthStr) {
  const y = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
  const m = monthStr ? parseInt(monthStr, 10) : 1;
  if (monthStr === "" || Number.isNaN(m)) return 31;
  return new Date(y, m, 0).getDate();
}

function formatCreatedAt(iso, lng) {
  if (!iso) return "—";
  try {
    const loc = lng === "bn" ? "bn-BD" : "en-US";
    return new Date(iso).toLocaleString(loc, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function getPdfFormat(pageSize, customWidthMm, customHeightMm) {
  if (pageSize !== "custom") return pageSize;
  const width = Math.max(20, Number(customWidthMm) || 210);
  const height = Math.max(20, Number(customHeightMm) || 297);
  return [width, height];
}

const AllQR = () => {
  const { t, i18n } = useTranslation();
  const axiosSecure = useAxiosSecure();

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    const out = [{ value: "", label: t("common.allYears") }];
    for (let i = y + 1; i >= y - 8; i--) {
      out.push({ value: String(i), label: String(i) });
    }
    return out;
  }, [t]);

  // PDF options state
  const [pdfPageFormat, setPdfPageFormat] = useState("letter");
  const [pdfPageOrientation, setPdfPageOrientation] = useState("p");
  const [pdfCustomWidth, setPdfCustomWidth] = useState(148); // mm
  const [pdfCustomHeight, setPdfCustomHeight] = useState(210); // mm

  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterQrType, setFilterQrType] = useState("");
  const [isPreviewingFiltered, setIsPreviewingFiltered] = useState(false);
  const [isDownloadingFiltered, setIsDownloadingFiltered] = useState(false);

  const maxDay = daysInMonth(filterYear || String(new Date().getFullYear()), filterMonth);

  const effectiveDay =
    filterMonth && filterDay && parseInt(filterDay, 10) > maxDay
      ? String(maxDay)
      : filterDay;

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (filterYear) p.set("year", filterYear);
    if (filterMonth) p.set("month", filterMonth);
    if (effectiveDay && filterMonth) p.set("day", effectiveDay);
    if (filterQrType) p.set("qrType", filterQrType);
    return p.toString();
  }, [filterYear, filterMonth, effectiveDay, filterQrType]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["dashboard-all-qr", filterYear, filterMonth, filterDay, filterQrType],
    queryFn: async () => {
      const q = queryParams ? `?${queryParams}` : "";
      const res = await axiosSecure.get(`/api/qr/allQR${q}`);
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const qrCodes = Array.isArray(data?.data) ? data.data : [];

  const resetFilters = () => {
    setFilterYear("");
    setFilterMonth("");
    setFilterDay("");
    setFilterQrType("");
  };

  const buildFilteredPdf = async () => {
    const pdfFormat = getPdfFormat(pdfPageFormat, pdfCustomWidth, pdfCustomHeight);
    const pdf = new jsPDF({
      orientation: pdfPageOrientation,
      unit: "mm",
      format: pdfFormat,
    });

    let cursor = {
      x: PDF_PAGE_INSET_BATCH.left,
      y: PDF_PAGE_INSET_BATCH.top,
      rowHeight: 0,
    };

    for (let i = 0; i < qrCodes.length; i++) {
      const item = qrCodes[i];
      const type = item?.qrType || "bike";
      const sticker = getStickerSizeMm(type);
      const qrCodeLabel = item?.code ? `QR - ${item.code}` : "QR";
      cursor = await placeVectorStickerOnPage(
        pdf,
        item,
        sticker,
        cursor,
        pdfFormat,
        pdfPageOrientation,
        qrCodeLabel,
        type,
        PDF_PAGE_INSET_BATCH
      );
    }
    return pdf;
  };

  const previewFilteredPdf = async () => {
    if (qrCodes.length === 0) return;
    setIsPreviewingFiltered(true);
    try {
      const pdf = await buildFilteredPdf();
      const previewBlob = pdf.output("blob");
      const previewUrl = URL.createObjectURL(previewBlob);
      window.open(previewUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000);
    } catch (e) {
      console.error("Preview filtered PDF error:", e);
    } finally {
      setIsPreviewingFiltered(false);
    }
  };

  const downloadFilteredPdf = async () => {
    if (qrCodes.length === 0) return;
    setIsDownloadingFiltered(true);
    try {
      const pdf = await buildFilteredPdf();
      const stamp = new Date().toISOString().slice(0, 10);
      const pdfPageLabel =
        pdfPageFormat === "custom"
          ? `${Math.max(20, Number(pdfCustomWidth) || 210)}x${Math.max(20, Number(pdfCustomHeight) || 297)}mm`
          : pdfPageFormat;
      pdf.save(`all-qr-filtered-${pdfPageLabel}-${stamp}.pdf`);
    } catch (e) {
      console.error("Download filtered PDF error:", e);
    } finally {
      setIsDownloadingFiltered(false);
    }
  };

  const dayOptions = useMemo(() => {
    const opts = [{ value: "", label: t("common.allDays") }];
    if (!filterMonth) return opts;
    const n = maxDay;
    for (let d = 1; d <= n; d++) {
      opts.push({ value: String(d), label: String(d) });
    }
    return opts;
  }, [filterMonth, maxDay, t]);

  const analytics = useMemo(
    () =>
      data?.analytics ?? {
        total: 0,
        assigned: 0,
        unassigned: 0,
        totalScans: 0,
        byType: {},
      },
    [data]
  );

  const statCards = useMemo(
    () => [
      {
        id: "total",
        title: t("dashboard.qr.all.stats.totalQr"),
        value: analytics.total,
        sub: t("dashboard.qr.all.stats.totalQrSub"),
        icon: QrCode,
        className: "border-blue-200 bg-blue-50/80 text-blue-800",
        iconBg: "bg-blue-600 text-white",
      },
      {
        id: "assigned",
        title: t("dashboard.qr.all.stats.assigned"),
        value: analytics.assigned,
        sub: t("dashboard.qr.all.stats.assignedSub"),
        icon: CheckCircle2,
        className: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
        iconBg: "bg-emerald-600 text-white",
      },
      {
        id: "unassigned",
        title: t("dashboard.qr.all.stats.unassigned"),
        value: analytics.unassigned,
        sub: t("dashboard.qr.all.stats.unassignedSub"),
        icon: CircleDashed,
        className: "border-amber-200 bg-amber-50/80 text-amber-900",
        iconBg: "bg-amber-500 text-white",
      },
      {
        id: "scans",
        title: t("dashboard.qr.all.stats.totalScans"),
        value: analytics.totalScans,
        sub: t("dashboard.qr.all.stats.totalScansSub"),
        icon: ScanLine,
        className: "border-violet-200 bg-violet-50/80 text-violet-900",
        iconBg: "bg-violet-600 text-white",
      },
      {
        id: "bike",
        title: t("dashboard.qr.all.stats.bikeTags"),
        value: analytics.byType?.bike ?? 0,
        sub: t("dashboard.qr.all.stats.bikeTagsSub"),
        icon: Bike,
        className: "border-teal-200 bg-teal-50/80 text-teal-900",
        iconBg: "bg-teal-600 text-white",
      },
      {
        id: "car",
        title: t("dashboard.qr.all.stats.carTags"),
        value: analytics.byType?.car ?? 0,
        sub: t("dashboard.qr.all.stats.carTagsSub"),
        icon: Car,
        className: "border-slate-300 bg-slate-100/90 text-slate-900",
        iconBg: "bg-slate-800 text-white",
      },
    ],
    [t, analytics]
  );

  if (isLoading && !data) {
    return <SmartLoader fullPage label={t("dashboard.qr.all.loading")} />;
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 via-white to-indigo-50/30 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {t("dashboard.qr.all.title")}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                {t("dashboard.qr.all.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-500">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            <span>{t("dashboard.qr.all.liveFilter")}</span>
            {isFetching && (
              <span className="loading loading-spinner loading-xs text-indigo-600" />
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t("dashboard.qr.all.filterHeading")}
          </span>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <label className="form-control w-full min-w-[160px] max-w-xs">
            <span className="label-text mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Bike className="h-3.5 w-3.5" />
              {t("dashboard.qr.all.typeLabel")}
              <span className="text-rose-500">*</span>
            </span>
            <select
              className="select select-bordered w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500"
              value={filterQrType}
              onChange={(e) => setFilterQrType(e.target.value)}
              required
            >
              <option value="">{t("dashboard.qr.all.allTypes")}</option>
              <option value="bike">{t("dashboard.qr.all.bike")}</option>
              <option value="car">{t("dashboard.qr.all.car")}</option>
            </select>
          </label>

          <label className="form-control w-full min-w-[140px] max-w-xs">
            <span className="label-text mb-1 text-xs font-medium text-slate-500">
              {t("dashboard.qr.all.year")}
            </span>
            <select
              className="select select-bordered w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500"
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setFilterDay("");
              }}
            >
              {yearOptions.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full min-w-[160px] max-w-xs">
            <span className="label-text mb-1 text-xs font-medium text-slate-500">
              {t("dashboard.qr.all.month")}
            </span>
            <select
              className="select select-bordered w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500"
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setFilterDay("");
              }}
            >
              <option value="">{t("common.allMonths")}</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={String(m)}>
                  {t(`common.months.${m}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full min-w-[120px] max-w-xs">
            <span className="label-text mb-1 text-xs font-medium text-slate-500">
              {t("dashboard.qr.all.day")}
            </span>
            <select
              className="select select-bordered w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 disabled:opacity-50"
              value={effectiveDay}
              disabled={!filterMonth}
              onChange={(e) => setFilterDay(e.target.value)}
            >
              {dayOptions.map((o) => (
                <option key={o.value || "all-d"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="btn btn-outline gap-2 rounded-xl border-slate-200"
            onClick={resetFilters}
          >
            <RotateCcw className="h-4 w-4" />
            {t("dashboard.qr.all.reset")}
          </button>
        </div>

        {/* PDF settings: page size, custom size, orientation */}
        <div className="flex flex-wrap gap-4 mt-5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 items-end">
          <div>
            <label className="label label-text text-xs font-medium text-slate-600 mb-1">
              Page Size
            </label>
            <select
              className="select select-bordered w-full rounded-xl border-slate-200 bg-white focus:border-indigo-500"
              value={pdfPageFormat}
              onChange={(e) => setPdfPageFormat(e.target.value)}
              style={{minWidth: 120}}
            >
              {PAGE_FORMATS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {pdfPageFormat === "custom" && (
            <>
              <div>
                <label className="label label-text text-xs font-medium text-slate-600 mb-1">
                  Custom Width (mm)
                </label>
                <input
                  type="number"
                  min={30}
                  max={800}
                  className="input input-bordered w-24 rounded-xl border-slate-200 bg-white focus:border-indigo-500"
                  value={pdfCustomWidth}
                  onChange={e => setPdfCustomWidth(e.target.value)}
                />
              </div>
              <div>
                <label className="label label-text text-xs font-medium text-slate-600 mb-1">
                  Custom Height (mm)
                </label>
                <input
                  type="number"
                  min={30}
                  max={800}
                  className="input input-bordered w-24 rounded-xl border-slate-200 bg-white focus:border-indigo-500"
                  value={pdfCustomHeight}
                  onChange={e => setPdfCustomHeight(e.target.value)}
                />
              </div>
            </>
          )}
          <div>
            <label className="label label-text text-xs font-medium text-slate-600 mb-1">
              Orientation
            </label>
            <select
              className="select select-bordered w-full rounded-xl border-slate-200 bg-white focus:border-indigo-500"
              value={pdfPageOrientation}
              onChange={e => setPdfPageOrientation(e.target.value)}
              style={{minWidth: 120}}
            >
              {PAGE_ORIENTATIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={previewFilteredPdf}
            disabled={isPreviewingFiltered || qrCodes.length === 0 || !filterQrType}
          >
            {isPreviewingFiltered ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Preview PDF
          </button>
          <button
            type="button"
            className="btn gap-2 rounded-xl border-none bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
            onClick={downloadFilteredPdf}
            disabled={isDownloadingFiltered || qrCodes.length === 0 || !filterQrType}
          >
            {isDownloadingFiltered ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Download PDF
          </button>
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5" />
          {t("dashboard.qr.all.filterHint")}
        </p>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
          <BarChart3 className="h-4 w-4" />
          {t("dashboard.qr.all.analytics")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`rounded-2xl border p-4 shadow-sm ${card.className}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium opacity-90">{card.title}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums">{card.value}</p>
                    <p className="mt-1 text-[11px] opacity-75">{card.sub}</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {error?.message || t("dashboard.qr.all.loadError")}
          <button
            type="button"
            className="btn btn-sm ml-3 rounded-lg"
            onClick={() => refetch()}
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      {qrCodes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center">
          <QrCode className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            {t("dashboard.qr.all.noResults")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {qrCodes.map((qr) => {
            const isAssigned = qr.status === "assigned" || qr.isAssigned;
            const type = qr.qrType || "bike";
            const previewScale = LIST_PREVIEW_SCALE[type] || LIST_PREVIEW_SCALE.bike;
            const previewHeight = LIST_PREVIEW_HEIGHT[type] || LIST_PREVIEW_HEIGHT.bike;
            return (
              <article
                key={qr._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="relative bg-linear-to-b from-slate-50 to-white px-4 pt-4">
                  <div
                    className="mx-auto flex w-full items-center justify-center overflow-hidden"
                    style={{ height: previewHeight }}
                  >
                    <div
                      className="origin-center"
                      style={{ transform: `scale(${previewScale})` }}
                    >
                      <StickerFramePreview qrCode={qr.qrCode} qrType={type} />
                    </div>
                  </div>
                  <div className="absolute right-3 top-3 flex gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        type === "car"
                          ? "bg-slate-800 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {type === "car" ? "Car" : "Bike"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className="break-all font-mono text-sm font-semibold text-slate-900">
                    {qr.code}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-2.5 py-1 font-semibold ${
                        isAssigned
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isAssigned ? "assigned" : qr.status || "unassigned"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                      {t("dashboard.qr.all.scan")}: {qr.scanCount ?? 0}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    {t("dashboard.qr.all.created")}:{" "}
                    {formatCreatedAt(qr.createdAt, i18n.language)}
                  </p>

                  <a
                    href={qr.qrLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm mt-auto gap-2 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    {t("dashboard.qr.all.openLink")}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllQR;
