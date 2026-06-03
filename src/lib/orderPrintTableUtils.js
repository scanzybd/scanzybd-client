/** Format plate numbers for confirmed-order print table (vehicleId populated). */
export function formatOrderPlateNumbers(order, fallback = "—") {
  const plates = [];
  for (const tag of order?.tagAssignments || []) {
    const v = tag?.vehicleId;
    const plate =
      typeof v === "object" && v !== null && v.plate != null
        ? String(v.plate).trim()
        : "";
    if (plate && !plates.includes(plate)) plates.push(plate);
  }
  return plates.length ? plates.join(", ") : fallback;
}

/** Format tag types for print table (tagType from API or productTitle fallback). */
export function formatOrderTagTypes(order, fallback = "—") {
  const types = [];
  for (const tag of order?.tagAssignments || []) {
    const t = String(tag.tagType || "").trim();
    if (t && !types.includes(t)) types.push(t);
  }
  return types.length ? types.join(", ") : fallback;
}
