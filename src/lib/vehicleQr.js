export const MAX_VEHICLE_QRS = 2;

/** QR document ids linked to a vehicle (supports legacy qrData). */
export function getVehicleQrIds(vehicle) {
  if (!vehicle) return [];
  let ids = Array.isArray(vehicle.qrIds)
    ? vehicle.qrIds.map((id) => String(id)).filter(Boolean)
    : [];
  if (ids.length === 0 && vehicle.qrData) {
    ids = [String(vehicle.qrData)];
  }
  return [...new Set(ids)].slice(0, MAX_VEHICLE_QRS);
}

export function canAssignMoreQr(vehicle) {
  return getVehicleQrIds(vehicle).length < MAX_VEHICLE_QRS;
}

/** Confirmed orders table: No QR | 1/2 | 2/2 */
export function formatVehicleQrSlotLabel(vehicle) {
  const n = getVehicleQrIds(vehicle).length;
  if (n === 0) return "No QR";
  if (n >= MAX_VEHICLE_QRS) return "2/2";
  return `${n}/2`;
}

export function qrAssignmentLabel(vehicle) {
  return formatVehicleQrSlotLabel(vehicle);
}
