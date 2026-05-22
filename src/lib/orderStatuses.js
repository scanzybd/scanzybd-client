/** Status options for admin/provider order management */
export const STAFF_ORDER_STATUS_OPTIONS = [
  "pending",
  "processing",
  "confirmed",
  "shipped",
  "delivered",
  "completed",
  "returned",
  "cancelled",
];

export const statusLabel = (s) =>
  String(s || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
