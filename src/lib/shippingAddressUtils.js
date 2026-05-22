/**
 * ADDR: Union/Ward, Upazila/Thana, District, Division (comma-separated)
 * Details in (): shippingAddress.line1 only
 */

const clean = (v) => String(v ?? "").trim();

/** Legacy orders: union + upazila were stored inside line1 */
function unionUpazilaFromLine1(line1) {
  const raw = clean(line1);
  if (!raw) return { union: "", upazila: "" };
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { union: parts[0], upazila: parts[1] };
  }
  return { union: "", upazila: "" };
}

function dedupeParts(parts) {
  const out = [];
  for (const p of parts) {
    const t = clean(p);
    if (!t) continue;
    const last = out[out.length - 1];
    if (last && last.toLowerCase() === t.toLowerCase()) continue;
    out.push(t);
  }
  return out;
}

/** Union, thana/upazila, district, division — for ADDR line (no line1) */
export function formatShippingAddrMain(ship = {}) {
  const fromLine1 = unionUpazilaFromLine1(ship.line1);
  const union = clean(ship.union) || fromLine1.union;
  const upazila = clean(ship.upazila) || fromLine1.upazila;
  const district = clean(ship.city);
  let division = clean(ship.division) || clean(ship.district);

  if (district && division && district.toLowerCase() === division.toLowerCase()) {
    division = "";
  }

  const main = dedupeParts([union, upazila, district, division]).join(", ");
  return main || "—";
}

/** Details = line1 (house / road / area) */
export function formatShippingLine1Details(ship = {}) {
  return clean(ship.line1);
}

/** Label: ADDR parts + (line1) when line1 exists */
export function formatShippingAddrForLabel(ship = {}) {
  const main = formatShippingAddrMain(ship);
  const line1 = formatShippingLine1Details(ship);
  if (!line1 || main === "—") {
    return line1 ? `(${line1})` : main;
  }
  return `${main} (${line1})`;
}

/** @param {{ detailsInParens?: boolean }} [opts] */
export function formatShippingAddr(ship = {}, opts = {}) {
  if (opts.detailsInParens) {
    return formatShippingAddrForLabel(ship);
  }
  return formatShippingAddrMain(ship);
}

export function formatShippingStreetLine(ship = {}) {
  return formatShippingLine1Details(ship);
}
