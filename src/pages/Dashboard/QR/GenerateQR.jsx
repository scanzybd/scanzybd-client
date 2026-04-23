import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Bike, Car, Download, FileDown, Loader2, QrCode } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import {
  companyNameSlug,
  COMPANY_PRINT_ORG_LINE,
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
  bike: { width: 360, height: 180 },
  car: { width: 300, height: 420 },
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

function getStickerSizeMm(type) {
  return STICKER_SIZE_MM[type] || STICKER_SIZE_MM.bike;
}

/**
 * Place one sticker on current page; add new page automatically if needed.
 * Returns next cursor position.
 */
function placeStickerOnLetterPage(pdf, imgData, stickerMm, cursor) {
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
    pdf.addPage("letter", "p");
    x = margin;
    y = margin;
    rowHeight = 0;
  }

  pdf.addImage(imgData, "PNG", x, y, stickerMm.w, stickerMm.h);
  rowHeight = Math.max(rowHeight, stickerMm.h);

  return { x: x + stickerMm.w + gap, y, rowHeight };
}

function PrintCardBike({ item }) {
  const phoneText = item?.code ? String(item.code).slice(-10) : "01841662686";
  return (
    <div
      className="flex h-full overflow-hidden rounded-[24px] bg-[#f7ea00] p-3"
      style={{ width: CARD_SIZE.bike.width, height: CARD_SIZE.bike.height }}
    >
      <div className="flex h-full w-full gap-3">
        <div className="flex w-[44%] flex-col rounded-[20px] bg-[#ededed] p-2">
          <div className="flex flex-1 items-center justify-center rounded-lg bg-white p-2">
            <img
              src={item.qrCode}
              alt=""
              className="h-full w-full object-contain"
              crossOrigin="anonymous"
              draggable={false}
            />
          </div>
          <p className="mt-1.5 text-center text-[7px] font-medium text-slate-700">
            Call-{phoneText}
          </p>
        </div>

        <div className="flex w-[56%] flex-col justify-between py-1 pr-1">
          <div className="ml-auto w-fit rounded-xl border border-[#e6da00] bg-[#fff260] px-4 py-0.5 text-[11px] font-bold text-slate-900 shadow-sm">
            Cre8
          </div>
          <div>
            <p className="inline-block rounded-r-2xl rounded-l-sm bg-[#1f88a2] px-4 py-0.5 text-[28px] font-black uppercase leading-none tracking-wide text-white">
              Scan To
            </p>
            <h3 className="mt-0.5 text-[52px] font-black leading-[0.88] tracking-tight text-[#003f76]">
              Contact
            </h3>
            <p className="text-[17px] font-black leading-[0.95] text-[#003f76]">
              Vehicle Owner
            </p>
          </div>
          <p className="text-center text-[8px] font-medium leading-tight text-slate-800">
            This QR is created from {COMPANY_PRINT_ORG_LINE}
          </p>
        </div>
      </div>
    </div>
  );
}

function PrintCardCar({ item }) {
  const phoneText = item?.code ? String(item.code).slice(-10) : "01841662686";
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[26px] bg-[#f7ea00] p-3"
      style={{ width: CARD_SIZE.car.width, height: CARD_SIZE.car.height }}
    >
      <div className="mb-1 flex justify-center">
        <div className="rounded-xl border border-[#e6da00] bg-[#fff260] px-5 py-0.5 text-[20px] font-bold text-slate-900 shadow-sm">
          Cre8
        </div>
      </div>

      <div className="relative rounded-[20px] bg-[#e9e9e9] p-2.5">
        <p className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[13px] font-medium tracking-wide text-slate-700">
          Scan Me
        </p>
        <p className="absolute right-1 top-1/2 -translate-y-1/2 rotate-90 text-[13px] font-medium tracking-wide text-slate-700">
          or Call-{phoneText}
        </p>
        <div className="flex items-center justify-center rounded-[16px] bg-white p-3">
          <img
            src={item.qrCode}
            alt=""
            className="h-[174px] w-[174px]"
            crossOrigin="anonymous"
            draggable={false}
          />
        </div>
      </div>

      <div className="mt-1.5">
        <p className="mx-auto w-fit -rotate-12 rounded-r-2xl rounded-l-sm bg-[#1f88a2] px-4 py-0.5 text-[30px] font-black uppercase leading-none tracking-wide text-white">
          Scan To
        </p>
      </div>

      <h3 className="mt-0.5 text-center text-[44px] font-black leading-[0.9] tracking-tight text-[#003f76]">
        Contact
      </h3>
      <p className="text-center text-[41px] font-black leading-[0.9] tracking-tight text-[#003f76]">
        Vehicle Owner
      </p>

      <p className="mt-1 text-center text-[7px] font-medium leading-tight text-slate-800">
        This QR is created from {COMPANY_PRINT_ORG_LINE}
      </p>
    </div>
  );
}

function QrPrintSurface({ item, qrType }) {
  const cfg = QR_TYPE_LAYOUT[qrType] || QR_TYPE_LAYOUT.bike;
  const ring = cfg.ringClass;
  const size = CARD_SIZE[qrType] || CARD_SIZE.bike;

  return (
    <div
      className={`overflow-hidden rounded-[24px] bg-white shadow-2xl ${ring}`}
      style={{ width: size.width, height: size.height }}
    >
      {qrType === "car" ? (
        <PrintCardCar item={item} />
      ) : (
        <PrintCardBike item={item} />
      )}
    </div>
  );
}

const QRGenerator = () => {
  const { t } = useTranslation();
  const axiosSecure = useAxiosSecure();

  const [qrList, setQrList] = useState([]);
  const [selectedType, setSelectedType] = useState("bike");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
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
    setDownloading(true);
    setError(null);
    try {
      const imgData = await captureNodePng(index);
      const item = qrList[index];
      const code = item?.code || index;
      const type = item?.qrType || selectedType;
      const sticker = getStickerSizeMm(type);
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "letter" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const x = (pageW - sticker.w) / 2;
      const y = (pageH - sticker.h) / 2;
      pdf.addImage(imgData, "PNG", x, y, sticker.w, sticker.h);
      pdf.save(`${companyNameSlug()}-QR-${type}-${code}.pdf`);
    } catch (e) {
      console.error(e);
      setError(t("dashboard.qr.generate.errPdf"));
    } finally {
      setDownloading(false);
    }
  };

  const downloadAllPDF = async () => {
    if (qrList.length === 0) return;
    setDownloading(true);
    setError(null);
    try {
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "letter" });
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
        cursor = placeStickerOnLetterPage(pdf, imgData, sticker, cursor);
      }

      const stamp = new Date().toISOString().slice(0, 10);
      pdf.save(`${companyNameSlug()}-QR-batch-${stamp}.pdf`);
    } catch (e) {
      console.error(e);
      setError(t("dashboard.qr.generate.errPdf"));
    } finally {
      setDownloading(false);
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

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            {error}
          </div>
        )}
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
            <button
              type="button"
              disabled={downloading}
              onClick={downloadAllPDF}
              className="btn gap-2 rounded-xl border-none bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              {t("dashboard.qr.generate.downloadAllPdf")}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 justify-items-center sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {qrList.map((item, index) => {
              const currentType = item.qrType || selectedType;
              return (
                <div
                  key={item._id || item.code || index}
                  className="flex w-full max-w-[320px] flex-col items-center gap-3"
                >
                  <div
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    className="origin-top scale-100"
                  >
                    <QrPrintSurface item={item} qrType={currentType} />
                  </div>
                  <p className="w-full truncate text-center font-mono text-xs text-slate-600">
                    {item.code}
                  </p>
                  <button
                    type="button"
                    disabled={downloading}
                    onClick={() => downloadSinglePdf(index)}
                    className="btn btn-sm w-full gap-2 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" />
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
