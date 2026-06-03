/** Shared labels & formatting for user orders / payments UI */

export function formatBdt(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "৳ 0";
  return `৳ ${n.toLocaleString("en-BD")}`;
}

export function formatOrderNo(orderNo) {
  if (orderNo == null || orderNo === "") return "—";
  const s = String(orderNo).trim();
  return s.startsWith("#") ? s : `#${s}`;
}

export function formatStatusLabel(value) {
  const s = String(value || "").trim().toLowerCase();
  const map = {
    unpaid: "Unpaid",
    paid: "Paid",
    failed: "Failed",
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
    success: "Success",
  };
  if (map[s]) return map[s];
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatOrderKind(kind) {
  const map = {
    purchase: "Purchase",
    renew_same_qr: "Renew · same QR",
    renew_new_qr: "Renew · new QR",
  };
  const key = String(kind || "purchase").toLowerCase();
  return map[key] || formatStatusLabel(kind);
}

export function formatPaymentMethod(method) {
  const map = {
    cash: "Cash",
    bkash_manual: "Manual bKash",
    bkash_online: "bKash Online",
    sslcommerz_online: "SSL Commerz",
    sslcommerz: "SSL Commerz",
    bkash: "bKash",
    sslcommerz: "SSL Commerz",
  };
  const key = String(method || "").toLowerCase();
  return map[key] || (method ? formatStatusLabel(method) : "—");
}

export function formatDateShort(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Prefer final bKash trx; fall back to payment ID */
export function formatTransactionId(payment) {
  if (!payment) return null;
  const trx = payment.transactionId?.trim();
  const pid = payment.paymentID?.trim();
  if (trx && pid && trx !== pid) return trx;
  return trx || pid || null;
}
