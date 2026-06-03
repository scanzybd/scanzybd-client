import { canAssignMoreQr, getVehicleQrIds } from "./vehicleQr";

/** QR codes when vehicle.qrIds is populated with { code }. */
export function getVehicleQrCodes(vehicle) {
  if (!vehicle || typeof vehicle !== "object") return [];
  const raw = vehicle.qrIds;
  if (!Array.isArray(raw)) return [];
  const codes = [];
  for (const entry of raw) {
    if (entry && typeof entry === "object" && entry.code) {
      codes.push(String(entry.code));
    }
  }
  return codes;
}

export function getTagVehicleId(tag) {
  const v = tag?.vehicleId;
  if (!v) return "";
  if (typeof v === "object" && v._id) return String(v._id);
  return String(v);
}

export function getTagPlate(tag) {
  const v = tag?.vehicleId;
  if (typeof v === "object" && v?.plate) return String(v.plate);
  return "—";
}

export function tagNeedsQrAssign(tag) {
  const v = tag?.vehicleId;
  if (!v || typeof v !== "object") return false;
  return canAssignMoreQr(v);
}

export function orderFulfillmentReady(order) {
  const tags = order?.tagAssignments || [];
  if (!tags.length) return false;
  return tags.every((tag) => vehicleHasQr(tag?.vehicleId));
}

export function buildScanAssignUrl(vehicleId, returnTo = "/dashboard/confirmed-orders") {
  const params = new URLSearchParams({
    vehicleId: String(vehicleId),
    returnTo,
  });
  return `/dashboard/scan-assign-vehicle?${params.toString()}`;
}

export function buildAssignConfirmUrl(qrCode, vehicleId, returnTo) {
  const params = new URLSearchParams();
  if (vehicleId) params.set("vehicleId", String(vehicleId));
  if (returnTo) params.set("returnTo", returnTo);
  const q = params.toString();
  return `/dashboard/assign-vehicle/${encodeURIComponent(qrCode)}${q ? `?${q}` : ""}`;
}

/** Legacy: qrIds may be id strings only */
export function vehicleHasQr(vehicle) {
  return getVehicleQrCodes(vehicle).length > 0 || getVehicleQrIds(vehicle).length > 0;
}
