import React from "react";
import { overlayCssStyle, resolveFrameSvgUrl } from "../../../lib/qrFrameRuntime";

/**
 * On-screen sticker preview (frame + QR image or placeholder).
 */
export default function QrStickerPreview({
  template,
  qrImageUrl,
  className = "",
  style,
}) {
  if (!template?.slug) return null;

  const frameSrc = resolveFrameSvgUrl(template);
  const overlay = overlayCssStyle(template);
  const size = template.cardSize || { width: 200, height: 180 };
  const frameZoom = template.frameZoom || 1;
  const offsetX = template.frameOffsetX ?? "0%";
  const offsetY = template.frameOffsetY ?? "0%";

  return (
    <div
      className={`relative overflow-hidden bg-white ${className}`}
      style={{ width: size.width, height: size.height, ...style }}
    >
      <img
        src={frameSrc}
        alt=""
        className="absolute left-1/2 top-1/2 h-full w-full object-contain"
        style={{
          left: `calc(50% + ${offsetX})`,
          top: `calc(50% + ${offsetY})`,
          transform: `translate(-50%, -50%) scale(${frameZoom})`,
          transformOrigin: "center center",
        }}
        draggable={false}
      />
      {qrImageUrl ? (
        <img
          src={qrImageUrl}
          alt=""
          className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"
          style={{ top: overlay.top, left: overlay.left, width: overlay.size }}
          crossOrigin="anonymous"
          draggable={false}
        />
      ) : (
        <div
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-dashed border-slate-400 bg-white/90 font-mono text-[10px] text-slate-500"
          style={{ top: overlay.top, left: overlay.left, width: overlay.size, aspectRatio: "1" }}
        >
          QR
        </div>
      )}
    </div>
  );
}

export function ringClassForTemplate(template) {
  const cat = template?.category || template?.slug;
  if (cat === "car" || template?.icon === "car") {
    return "ring-2 ring-blue-700/90";
  }
  if (cat === "bike" || template?.icon === "bike") {
    return "ring-2 ring-emerald-600/90";
  }
  return "ring-2 ring-violet-600/90";
}

export function listPreviewStyle(template) {
  const h = Number(template?.cardSize?.height) || 180;
  const scale = h > 250 ? 0.35 : 0.48;
  return {
    scale,
    height: Math.round(h * scale),
  };
}
