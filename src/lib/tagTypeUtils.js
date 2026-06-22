/** @param {string} tagTypeName */
/** @param {Array<{ name?: string, isCycle?: boolean }>} [tagTypes] */
export function isCycleTagType(tagTypeName, tagTypes = []) {
  const name = String(tagTypeName || "").trim();
  if (!name) return false;

  if (Array.isArray(tagTypes) && tagTypes.length > 0) {
    const row = tagTypes.find(
      (t) => String(t?.name || "").trim().toLowerCase() === name.toLowerCase()
    );
    if (row) return Boolean(row.isCycle);
  }

  return name.toLowerCase() === "cycle tag";
}

/** @param {string} tagTypeName — true for bike tag types (no driver concept). */
export function isBikeTagType(tagTypeName) {
  const name = String(tagTypeName || "").trim().toLowerCase();
  if (!name) return false;
  return name.includes("bike");
}

/**
 * Tag types that should not collect a driver (cycle + bike).
 * @param {string} tagTypeName
 * @param {Array<{ name?: string, isCycle?: boolean }>} [tagTypes]
 */
export function isDriverlessTagType(tagTypeName, tagTypes = []) {
  return isCycleTagType(tagTypeName, tagTypes) || isBikeTagType(tagTypeName);
}

/** @param {unknown} payload */
export function normalizeTagTypesList(payload) {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];
  return rows
    .map((row) => ({
      name: String(row?.name || "").trim(),
      isCycle: Boolean(row?.isCycle),
      sortOrder: Number(row?.sortOrder) || 0,
    }))
    .filter((row) => row.name);
}
