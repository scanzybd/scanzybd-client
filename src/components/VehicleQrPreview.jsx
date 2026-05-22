import React from "react";
import { QrCode, Shield } from "lucide-react";
import { getVehicleQrIds } from "../lib/vehicleQr";

/**
 * @param {object} props
 * @param {object} props.vehicle
 * @param {Record<string, object>} props.qrMap — keyed by QR _id
 * @param {boolean} [props.compact]
 */
const VehicleQrPreview = ({ vehicle, qrMap = {}, compact = false }) => {
  const ids = getVehicleQrIds(vehicle);
  const size = compact ? 72 : 88;

  if (ids.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-slate-400"
        style={{ width: size, height: size }}
      >
        <Shield className="h-6 w-6" />
        <span className="mt-1 text-[10px]">No QR</span>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${compact ? "flex-row" : "flex-col sm:flex-row"}`}>
      {ids.map((id) => {
        const qr = qrMap[String(id)];
        return (
          <div key={id} className="flex flex-col items-center">
            {qr?.qrCode ? (
              <>
                <img
                  src={qr.qrCode}
                  alt=""
                  className="rounded-lg bg-white object-contain"
                  style={{ width: size, height: size }}
                  loading="lazy"
                />
                <p className="mt-1 max-w-[90px] truncate text-center text-[10px] text-slate-500">
                  {qr.code}
                </p>
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center rounded-lg bg-slate-100"
                style={{ width: size, height: size }}
              >
                <QrCode className="h-5 w-5 text-slate-400" />
                <span className="mt-1 text-[9px] text-slate-400">…</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VehicleQrPreview;
