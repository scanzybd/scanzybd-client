import { Link } from "react-router-dom";
import { QrCode, CheckCircle2, ScanLine } from "lucide-react";
import {
  buildScanAssignUrl,
  getTagPlate,
  getTagVehicleId,
  orderFulfillmentReady,
  tagNeedsQrAssign,
} from "../../lib/orderFulfillmentUtils";
import { formatVehicleQrSlotLabel, getVehicleQrIds } from "../../lib/vehicleQr";

const RETURN_PATH = "/dashboard/confirmed-orders";

/**
 * Per-order vehicles + QR assign actions (Confirmed Orders fulfillment).
 */
export default function OrderFulfillmentTags({ order }) {
  const tags = Array.isArray(order?.tagAssignments) ? order.tagAssignments : [];
  if (tags.length === 0) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-400">
        No vehicles linked to this order.
      </p>
    );
  }

  const ready = orderFulfillmentReady(order);

  return (
    <div className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
          <QrCode className="h-3.5 w-3.5" />
          Tags &amp; vehicles
        </h3>
        {ready ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
            <CheckCircle2 className="h-3 w-3" />
            QR ready
          </span>
        ) : (
          <span className="text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-400">
            QR assign pending
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-emerald-200/80 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:border-emerald-900/60">
              <th className="py-1.5 pr-2">Tag type</th>
              <th className="py-1.5 pr-2">Plate</th>
              <th className="py-1.5 pr-2">QR</th>
              <th className="py-1.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag, idx) => {
              const vehicleId = getTagVehicleId(tag);
              const plate = getTagPlate(tag);
              const tagType = tag.tagType || tag.productTitle || "—";
              const vehicle = tag.vehicleId;
              const qrSlotLabel =
                typeof vehicle === "object"
                  ? formatVehicleQrSlotLabel(vehicle)
                  : "No QR";
              const qrCount =
                typeof vehicle === "object" ? getVehicleQrIds(vehicle).length : 0;
              const needsAssign = tagNeedsQrAssign(tag);

              return (
                <tr
                  key={`${vehicleId}-${idx}`}
                  className="border-b border-emerald-100/80 last:border-0 dark:border-emerald-900/40"
                >
                  <td className="py-2 pr-2 text-slate-800 dark:text-slate-200">{tagType}</td>
                  <td className="py-2 pr-2 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {plate}
                  </td>
                  <td className="py-2 pr-2 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {qrSlotLabel}
                  </td>
                  <td className="py-2 text-right">
                    {needsAssign && vehicleId ? (
                      <Link
                        to={buildScanAssignUrl(vehicleId, RETURN_PATH)}
                        className="btn btn-xs gap-1 rounded-lg border-0 bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <ScanLine className="h-3 w-3" />
                        Assign QR
                      </Link>
                    ) : qrCount > 0 ? (
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        Assigned
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
