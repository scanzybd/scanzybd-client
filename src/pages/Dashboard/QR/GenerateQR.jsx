import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Bike, Car, Download, FileDown, Loader2, QrCode } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

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

const CARD_W_PX = 288;
const CARD_H_PX = 384;

const toPngOptions = {
  pixelRatio: 3,
  backgroundColor: "#ffffff",
  cacheBust: true,
};

/** Fits image on A4 with safe margins — suitable for home / press printing. */
function addPrintImagePage(pdf, imgData, imgProps, isFirstPage) {
  if (!isFirstPage) pdf.addPage();
  const marginPt = 40;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const maxW = pageWidth - 2 * marginPt;
  const maxH = pageHeight - 2 * marginPt;
  let w = maxW;
  let h = (imgProps.height * w) / imgProps.width;
  if (h > maxH) {
    h = maxH;
    w = (imgProps.width * h) / imgProps.height;
  }
  const x = (pageWidth - w) / 2;
  const y = (pageHeight - h) / 2;
  pdf.addImage(imgData, "PNG", x, y, w, h);
}

function PrintCardBike({ item }) {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[22px] bg-white"
      style={{ width: CARD_W_PX, height: CARD_H_PX }}
    >
      <div className="flex shrink-0 items-center justify-center gap-2 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 px-3 py-3 text-white">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Bike className="h-6 w-6" strokeWidth={2.2} />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
            Vehicle tag
          </p>
          <p className="text-lg font-black leading-tight tracking-tight">BIKE</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-gradient-to-b from-stone-50 to-white px-4 py-3">
        <p className="text-center text-[11px] font-semibold text-stone-600">
          National Youth Skill Development Training Institute
        </p>
        <div className="rounded-2xl bg-white p-2 shadow-inner ring-1 ring-stone-200/80">
          <img
            src={item.qrCode}
            alt=""
            className="h-[176px] w-[176px]"
            crossOrigin="anonymous"
            draggable={false}
          />
        </div>
        <p className="text-center text-[10px] font-medium text-stone-500">
          Scan to contact owner
        </p>
      </div>

      <div className="shrink-0 bg-emerald-950 px-2 py-2.5 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-100/90">
          Scan to verify · NYSDTI
        </p>
      </div>
    </div>
  );
}

function PrintCardCar({ item }) {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[18px] bg-white"
      style={{ width: CARD_W_PX, height: CARD_H_PX }}
    >
      <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-4 py-4 text-white">
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
            <Car className="h-7 w-7" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-200">
              Official tag
            </p>
            <p className="text-xl font-black tracking-tight">CAR</p>
            <p className="mt-0.5 text-[10px] text-blue-100/90">
              National Youth Skill Development Training Institute
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-slate-50 px-4 py-4">
        <div className="w-full border-y border-dashed border-slate-300 py-1 text-center text-[10px] font-medium uppercase tracking-widest text-slate-500">
          Scan below
        </div>
        <div className="rounded-2xl bg-white p-2.5 shadow-md ring-2 ring-slate-200">
          <img
            src={item.qrCode}
            alt=""
            className="h-[168px] w-[168px]"
            crossOrigin="anonymous"
            draggable={false}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 bg-slate-950 px-3 py-2.5 text-[9px] text-slate-300">
        <span className="font-semibold uppercase tracking-wider text-slate-400">
          Secure QR
        </span>
        <span className="text-slate-100">Ready to print</span>
      </div>
    </div>
  );
}

function QrPrintSurface({ item, qrType }) {
  const cfg = QR_TYPE_LAYOUT[qrType] || QR_TYPE_LAYOUT.bike;
  const ring = cfg.ringClass;

  return (
    <div
      className={`overflow-hidden rounded-[24px] bg-white shadow-2xl ${ring}`}
      style={{ width: CARD_W_PX, height: CARD_H_PX }}
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
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const imgProps = pdf.getImageProperties(imgData);
      addPrintImagePage(pdf, imgData, imgProps, true);
      const item = qrList[index];
      const code = item?.code || index;
      const type = item?.qrType || selectedType;
      pdf.save(`NYSDTI-QR-${type}-${code}.pdf`);
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
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

      for (let i = 0; i < qrList.length; i++) {
        const imgData = await captureNodePng(i);
        const imgProps = pdf.getImageProperties(imgData);
        addPrintImagePage(pdf, imgData, imgProps, i === 0);
      }

      const stamp = new Date().toISOString().slice(0, 10);
      pdf.save(`NYSDTI-QR-batch-${stamp}.pdf`);
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
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-6 shadow-sm sm:p-8">
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
              const t = item.qrType || selectedType;
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
                    <QrPrintSurface item={item} qrType={t} />
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
