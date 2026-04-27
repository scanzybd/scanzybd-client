import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Bike, Car, Download, Eye, FileDown, Loader2, QrCode } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import qrBikeFrame from "../../../assets/qr-frame/QR UI-bike.svg";
import qrCarFrame from "../../../assets/qr-frame/QR UI-car.svg";
import {
  companyNameSlug,
} from "../../../config/company";

/** Visual layout only — labels come from i18n (`dashboard.qr.generate.types.*`). */
const QR_TYPE_LAYOUT = {
  bike: {
    Icon: Bike,
    ringClass: "ring-2 ring-emerald-600/90",
  },
  car: {
    Icon: Car,
    ringClass: "ring-2 ring-blue-700/90",
  },
};

const CARD_SIZE = {
  bike: { width: 335, height: 180 },
  car: { width: 300, height: 410 },
};

const QR_FRAME_ASSET = {
  bike: qrBikeFrame,
  car: qrCarFrame,
};

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

const toPngOptions = {
  pixelRatio: 3,
  backgroundColor: "#ffffff",
  cacheBust: true,
};

const PAGE_LAYOUT_MM = {
  margin: 0,
  gap: 0,
};

const STICKER_SIZE_MM = {
  bike: { w: 76.2, h: 38.1 }, // 3 x 1.5 inch
  car: { w: 63.5, h: 88.9 }, // 2.5 x 3.5 inch
};
const STICKER_MARGIN_MM = 1;
const PDF_LAYOUT_OPTIONS = [
  { value: "p", label: "Portrait" },
  { value: "l", label: "Landscape" },
];
const PDF_PAGE_SIZE_OPTIONS = [
  "a0",
  "a1",
  "a2",
  "a3",
  "a4",
  "a5",
  "a6",
  "a7",
  "a8",
  "a9",
  "a10",
  "b0",
  "b1",
  "b2",
  "b3",
  "b4",
  "b5",
  "b6",
  "b7",
  "b8",
  "b9",
  "b10",
  "c0",
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c7",
  "c8",
  "c9",
  "c10",
  "dl",
  "letter",
  "government-letter",
  "legal",
  "junior-legal",
  "ledger",
  "tabloid",
  "credit-card",
  "custom",
];

function getStickerSizeMm(type) {
  return STICKER_SIZE_MM[type] || STICKER_SIZE_MM.bike;
}

function getPdfFormat(pageSize, customWidthMm, customHeightMm) {
  if (pageSize !== "custom") return pageSize;
  const width = Math.max(20, Number(customWidthMm) || 210);
  const height = Math.max(20, Number(customHeightMm) || 297);
  return [width, height];
}

/**
 * Place one sticker on current page; add new page automatically if needed.
 * Returns next cursor position.
 */
function placeStickerOnPage(
  pdf,
  imgData,
  stickerMm,
  cursor,
  pageSize,
  pageLayout
) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const { margin, gap } = PAGE_LAYOUT_MM;

  let { x, y, rowHeight } = cursor;

  if (x + stickerMm.w > pageW - margin) {
    x = margin;
    y += rowHeight + gap;
    rowHeight = 0;
  }

  if (y + stickerMm.h > pageH - margin) {
    pdf.addPage(pageSize, pageLayout);
    x = margin;
    y = margin;
    rowHeight = 0;
  }

  const innerW = Math.max(1, stickerMm.w - STICKER_MARGIN_MM * 2);
  const innerH = Math.max(1, stickerMm.h - STICKER_MARGIN_MM * 2);
  pdf.addImage(
    imgData,
    "PNG",
    x + STICKER_MARGIN_MM,
    y + STICKER_MARGIN_MM,
    innerW,
    innerH
  );
  rowHeight = Math.max(rowHeight, stickerMm.h);

  return { x: x + stickerMm.w + gap, y, rowHeight };
}

function PrintCardFrame({ item, qrType }) {
  const frameSrc = QR_FRAME_ASSET[qrType] || QR_FRAME_ASSET.bike;
  const overlay = QR_OVERLAY_LAYOUT[qrType] || QR_OVERLAY_LAYOUT.bike;
  const frameZoom = FRAME_ZOOM_LAYOUT[qrType] || FRAME_ZOOM_LAYOUT.bike;
  const frameOffset = FRAME_OFFSET_LAYOUT[qrType] || FRAME_OFFSET_LAYOUT.bike;

  return (
    <div className="relative h-full w-full overflow-hidden">
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
        draggable={false}
      />
      <img
        src={item.qrCode}
        alt=""
        className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"
        style={{ top: overlay.top, left: overlay.left, width: overlay.size }}
        crossOrigin="anonymous"
        draggable={false}
      />
    </div>
  );
}

function QrPrintSurface({ item, qrType }) {
  const size = CARD_SIZE[qrType] || CARD_SIZE.bike;

  return (
    <div
      className="overflow-hidden bg-white"
      style={{ width: size.width, height: size.height }}
    >
      <PrintCardFrame item={item} qrType={qrType} />
    </div>
  );
}

const QRGenerator = () => {
  const { t } = useTranslation();
  const axiosSecure = useAxiosSecure();

  const [qrList, setQrList] = useState([]);
  const [selectedType, setSelectedType] = useState("bike");
  const [selectedPdfPageSize, setSelectedPdfPageSize] = useState("letter");
  const [selectedPdfLayout, setSelectedPdfLayout] = useState("p");
  const [customPdfWidthMm, setCustomPdfWidthMm] = useState("210");
  const [customPdfHeightMm, setCustomPdfHeightMm] = useState("297");
  const [loading, setLoading] = useState(false);
  const [isPreviewingAll, setIsPreviewingAll] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadingSingleIndex, setDownloadingSingleIndex] = useState(null);
  const [error, setError] = useState(null);

  const cardRefs = useRef({});

  const typeKeys = Object.keys(QR_TYPE_LAYOUT);

  const generateQR = async () => {
    const raw = document.getElementById("qr-count")?.value;
    const count = Math.min(50, Math.max(1, Number(raw) || 1));

    setError(null);
    setLoading(true);
    try {
      const res = await axiosSecure.post("/api/qr/generate", {
        count,
        qrType: selectedType,
      });

      setQrList(res.data.data || []);
    } catch (err) {
      console.error("QR generate error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("dashboard.qr.generate.errGenerate")
      );
    } finally {
      setLoading(false);
    }
  };

  const captureNodePng = async (index) => {
    const node = cardRefs.current[index];
    if (!node) throw new Error("Card not ready");
    return toPng(node, toPngOptions);
  };

  /** Single tag — one A4 page, centered, print-ready. */
  const downloadSinglePdf = async (index) => {
    setDownloadingSingleIndex(index);
    setError(null);
    try {
      const imgData = await captureNodePng(index);
      const item = qrList[index];
      const code = item?.code || index;
      const type = item?.qrType || selectedType;
      const sticker = getStickerSizeMm(type);
      const pdfFormat = getPdfFormat(
        selectedPdfPageSize,
        customPdfWidthMm,
        customPdfHeightMm
      );
      const pdfPageLabel =
        selectedPdfPageSize === "custom"
          ? `${Math.max(20, Number(customPdfWidthMm) || 210)}x${Math.max(20, Number(customPdfHeightMm) || 297)}mm`
          : selectedPdfPageSize;
      const pdf = new jsPDF({
        orientation: selectedPdfLayout,
        unit: "mm",
        format: pdfFormat,
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const x = (pageW - sticker.w) / 2;
      const y = (pageH - sticker.h) / 2;
      const innerW = Math.max(1, sticker.w - STICKER_MARGIN_MM * 2);
      const innerH = Math.max(1, sticker.h - STICKER_MARGIN_MM * 2);
      pdf.addImage(
        imgData,
        "PNG",
        x + STICKER_MARGIN_MM,
        y + STICKER_MARGIN_MM,
        innerW,
        innerH
      );
      pdf.save(`${companyNameSlug()}-QR-${type}-${code}-${pdfPageLabel}.pdf`);
    } catch (e) {
      console.error(e);
      setError(t("dashboard.qr.generate.errPdf"));
    } finally {
      setDownloadingSingleIndex(null);
    }
  };

  const downloadAllPDF = async () => {
    if (qrList.length === 0) return;
    setIsDownloadingAll(true);
    setError(null);
    try {
      const pdf = await buildBatchPdf();
      const stamp = new Date().toISOString().slice(0, 10);
      const pdfPageLabel =
        selectedPdfPageSize === "custom"
          ? `${Math.max(20, Number(customPdfWidthMm) || 210)}x${Math.max(20, Number(customPdfHeightMm) || 297)}mm`
          : selectedPdfPageSize;
      pdf.save(`${companyNameSlug()}-QR-batch-${pdfPageLabel}-${stamp}.pdf`);
    } catch (e) {
      console.error(e);
      setError(t("dashboard.qr.generate.errPdf"));
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const buildBatchPdf = async () => {
    const pdfFormat = getPdfFormat(
      selectedPdfPageSize,
      customPdfWidthMm,
      customPdfHeightMm
    );
    const pdf = new jsPDF({
      orientation: selectedPdfLayout,
      unit: "mm",
      format: pdfFormat,
    });
    let cursor = {
      x: PAGE_LAYOUT_MM.margin,
      y: PAGE_LAYOUT_MM.margin,
      rowHeight: 0,
    };

    for (let i = 0; i < qrList.length; i++) {
      const imgData = await captureNodePng(i);
      const item = qrList[i];
      const type = item?.qrType || selectedType;
      const sticker = getStickerSizeMm(type);
      cursor = placeStickerOnPage(
        pdf,
        imgData,
        sticker,
        cursor,
        pdfFormat,
        selectedPdfLayout
      );
    }

    return pdf;
  };

  const previewAllPDF = async () => {
    if (qrList.length === 0) return;
    setIsPreviewingAll(true);
    setError(null);
    try {
      const pdf = await buildBatchPdf();
      const previewBlob = pdf.output("blob");
      const previewUrl = URL.createObjectURL(previewBlob);
      const previewWindow = window.open(previewUrl, "_blank", "noopener,noreferrer");
      if (!previewWindow) {
        URL.revokeObjectURL(previewUrl);
        setError("Popup blocked. Please allow popups to preview PDF.");
        return;
      }
      setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000);
    } catch (e) {
      console.error(e);
      setError(t("dashboard.qr.generate.errPdf"));
    } finally {
      setIsPreviewingAll(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 via-white to-blue-50/40 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {t("dashboard.qr.generate.title")}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                {t("dashboard.qr.generate.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t("dashboard.qr.generate.tagType")}
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {typeKeys.map((key) => {
              const cfg = QR_TYPE_LAYOUT[key];
              const Icon = cfg.Icon;
              const active = selectedType === key;
              const sub = t(`dashboard.qr.generate.types.${key}.sub`);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedType(key)}
                  className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                    active
                      ? "border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-600/20"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {t(`dashboard.qr.generate.types.${key}.label`)}
                      {sub ? (
                        <span className="font-normal text-slate-500"> ({sub})</span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {t(`dashboard.qr.generate.types.${key}.description`)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:w-auto">
            <div className="w-full sm:w-36">
              <label
                htmlFor="qr-count"
                className="mb-1 block text-xs font-medium text-slate-500"
              >
                {t("dashboard.qr.generate.countLabel")}
              </label>
              <input
                id="qr-count"
                type="number"
                min={1}
                max={50}
                defaultValue={4}
                className="input input-bordered w-full rounded-xl border-slate-200 bg-slate-50 focus:border-blue-500"
              />
            </div>
            <button
              type="button"
              disabled={loading}
              className="btn btn-primary rounded-xl border-none bg-blue-600 px-6 text-white hover:bg-blue-700 disabled:opacity-60"
              onClick={generateQR}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("dashboard.qr.generate.generating")}
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  {t("dashboard.qr.generate.generate")}
                </>
              )}
            </button>
          </div>
        </div>

        {error && null}
      </div>

      {/* Results */}
      {qrList.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {t("dashboard.qr.generate.created", { count: qrList.length })}
              </h2>
              <p className="text-sm text-slate-500">
                {t("dashboard.qr.generate.previewHint")}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="w-[110px]">
                <label
                  htmlFor="pdf-page-size"
                  className="mb-1 block text-xs font-medium text-slate-500"
                >
                  PDF Page
                </label>
                <select
                  id="pdf-page-size"
                  value={selectedPdfPageSize}
                  onChange={(e) => setSelectedPdfPageSize(e.target.value)}
                  className="select select-bordered h-10 w-full rounded-xl border-slate-200 bg-white focus:border-blue-500"
                >
                  {PDF_PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size === "custom" ? "CUSTOM" : size.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-[120px]">
                <label
                  htmlFor="pdf-layout"
                  className="mb-1 block text-xs font-medium text-slate-500"
                >
                  Layout
                </label>
                <select
                  id="pdf-layout"
                  value={selectedPdfLayout}
                  onChange={(e) => setSelectedPdfLayout(e.target.value)}
                  className="select select-bordered h-10 w-full rounded-xl border-slate-200 bg-white focus:border-blue-500"
                >
                  {PDF_LAYOUT_OPTIONS.map((layout) => (
                    <option key={layout.value} value={layout.value}>
                      {layout.label}
                    </option>
                  ))}
                </select>
              </div>
              {selectedPdfPageSize === "custom" && (
                <div className="flex items-end gap-2">
                  <div className="w-[90px]">
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      W (mm)
                    </label>
                    <input
                      type="number"
                      min={20}
                      value={customPdfWidthMm}
                      onChange={(e) => setCustomPdfWidthMm(e.target.value)}
                      className="input input-bordered h-10 w-full rounded-xl border-slate-200 bg-white focus:border-blue-500"
                    />
                  </div>
                  <div className="w-[90px]">
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      H (mm)
                    </label>
                    <input
                      type="number"
                      min={20}
                      value={customPdfHeightMm}
                      onChange={(e) => setCustomPdfHeightMm(e.target.value)}
                      className="input input-bordered h-10 w-full rounded-xl border-slate-200 bg-white focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
              <button
                type="button"
                disabled={isPreviewingAll}
                onClick={previewAllPDF}
                className="btn gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {isPreviewingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Preview All PDF
              </button>
              <button
                type="button"
                disabled={isDownloadingAll}
                onClick={downloadAllPDF}
                className="btn gap-2 rounded-xl border-none bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {isDownloadingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                {t("dashboard.qr.generate.downloadAllPdf")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 justify-items-center sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {qrList.map((item, index) => {
              const currentType = item.qrType || selectedType;
              const cfg = QR_TYPE_LAYOUT[currentType] || QR_TYPE_LAYOUT.bike;
              return (
                <div
                  key={item._id || item.code || index}
                  className="flex w-full max-w-[320px] flex-col items-center gap-3"
                >
                  <div className={`origin-top shadow-2xl ${cfg.ringClass}`}>
                    <div
                      ref={(el) => {
                        cardRefs.current[index] = el;
                      }}
                      className="origin-top scale-100"
                    >
                      <QrPrintSurface item={item} qrType={currentType} />
                    </div>
                  </div>
                  <p className="w-full truncate text-center font-mono text-xs text-slate-600">
                    {item.code}
                  </p>
                  <button
                    type="button"
                    disabled={downloadingSingleIndex === index}
                    onClick={() => downloadSinglePdf(index)}
                    className="btn btn-sm w-full gap-2 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  >
                    {downloadingSingleIndex === index ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {t("dashboard.qr.generate.downloadSingle")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {qrList.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          <QrCode className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            {t("dashboard.qr.generate.emptyHint")}
          </p>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;
