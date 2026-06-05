import React, { useEffect, useMemo, useState } from "react";
import { getPageDimensionsMm, PDF_ORIENTATIONS, PDF_PAGE_FORMATS, simulateStickerLayout } from "../../../lib/qrPageLayout";
import { resolvePageInset } from "../../../lib/qrFrameRuntime";

const MAX_PREVIEW_WIDTH_PX = 360;

/**
 * Visual preview of batch PDF page layout (margins, gap, sticker grid).
 */
export default function QrPdfPageLayoutPreview({ template }) {
  const [pageFormat, setPageFormat] = useState("letter");
  const [orientation, setOrientation] = useState("p");
  const [customW, setCustomW] = useState(210);
  const [customH, setCustomH] = useState(297);
  const [previewPage, setPreviewPage] = useState(0);

  const pageInset = resolvePageInset(template);
  const stickerMm = template?.stickerMm || { w: 80, h: 45 };
  const { w: pageW, h: pageH } = getPageDimensionsMm(pageFormat, orientation, customW, customH);

  const layout = useMemo(
    () =>
      simulateStickerLayout({
        pageW,
        pageH,
        stickerMm,
        pageInset,
        maxStickers: 60,
      }),
    [pageW, pageH, stickerMm, pageInset]
  );

  const pages = layout.pages;

  useEffect(() => {
    if (previewPage > 0 && previewPage >= pages.length) {
      setPreviewPage(0);
    }
  }, [pages.length, previewPage]);

  const safePage = Math.min(previewPage, Math.max(0, pages.length - 1));
  const current = pages[safePage] || { placements: [] };
  const scale = MAX_PREVIEW_WIDTH_PX / pageW;
  const previewH = pageH * scale;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-1 font-semibold text-slate-900">PDF page layout preview</h2>
      <p className="mb-4 text-xs text-slate-500">
        Batch download — margins &amp; gap (mm). Sticker size from template.
      </p>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <label className="form-control">
          <span className="label-text text-[10px]">Page</span>
          <select
            className="select select-bordered select-sm rounded-lg"
            value={pageFormat}
            onChange={(e) => {
              setPageFormat(e.target.value);
              setPreviewPage(0);
            }}
          >
            {PDF_PAGE_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-control">
          <span className="label-text text-[10px]">Orientation</span>
          <select
            className="select select-bordered select-sm rounded-lg"
            value={orientation}
            onChange={(e) => {
              setOrientation(e.target.value);
              setPreviewPage(0);
            }}
          >
            {PDF_ORIENTATIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        {pages.length > 1 ? (
          <label className="form-control">
            <span className="label-text text-[10px]">Preview page</span>
            <select
              className="select select-bordered select-sm rounded-lg"
              value={safePage}
              onChange={(e) => setPreviewPage(Number(e.target.value))}
            >
              {pages.map((p, i) => (
                <option key={p.index} value={i}>
                  Page {i + 1} ({p.placements.length} stickers)
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="flex items-end text-xs text-slate-500">
            {current.placements.length} sticker(s) on page 1
          </div>
        )}
      </div>

      {pageFormat === "custom" && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          <label className="form-control">
            <span className="label-text text-[10px]">W (mm)</span>
            <input
              type="number"
              min={20}
              className="input input-bordered input-sm rounded-lg"
              value={customW}
              onChange={(e) => setCustomW(Number(e.target.value))}
            />
          </label>
          <label className="form-control">
            <span className="label-text text-[10px]">H (mm)</span>
            <input
              type="number"
              min={20}
              className="input input-bordered input-sm rounded-lg"
              value={customH}
              onChange={(e) => setCustomH(Number(e.target.value))}
            />
          </label>
        </div>
      )}

      <div className="flex justify-center overflow-auto rounded-xl bg-slate-100 p-4">
        <div
          className="relative bg-white shadow-md"
          style={{
            width: pageW * scale,
            height: previewH,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 9px, #f1f5f9 9px, #f1f5f9 10px), repeating-linear-gradient(90deg, transparent, transparent 9px, #f1f5f9 9px, #f1f5f9 10px)",
            backgroundSize: `${10 * scale}px ${10 * scale}px`,
          }}
        >
          {/* printable margin guide */}
          <div
            className="pointer-events-none absolute border border-dashed border-indigo-300/80 bg-indigo-50/20"
            style={{
              left: pageInset.left * scale,
              top: pageInset.top * scale,
              width: (pageW - pageInset.left - pageInset.right) * scale,
              height: (pageH - pageInset.top - pageInset.bottom) * scale,
            }}
          />

          {current.placements.map((p) => (
            <div
              key={`${p.index}-${p.x}-${p.y}`}
              className="absolute border border-emerald-600/70 bg-emerald-400/25"
              style={{
                left: p.x * scale,
                top: p.y * scale,
                width: p.w * scale,
                height: p.h * scale,
              }}
              title={`Sticker ${p.index + 1}`}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 text-center font-mono text-[10px] text-slate-500">
        {pageW}×{pageH} mm · margin T{pageInset.top} B{pageInset.bottom} L{pageInset.left} R
        {pageInset.right} · gap {pageInset.gap} mm
      </p>
    </div>
  );
}
