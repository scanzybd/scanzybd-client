import { jsPDF } from "jspdf";
import {
  COMPANY_NAME,
  COMPANY_LEGAL_NAME,
  companyNameSlug,
} from "../config/company";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** jsPDF Helvetica cannot render ৳ — use Tk. + grouped digits (ASCII-safe). */
function formatMoney(amount) {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  const hasDecimals = Math.abs(safe % 1) > 0.001;
  const fixed = hasDecimals ? safe.toFixed(2) : String(Math.round(safe));
  const [intPart, decPart] = fixed.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const num = decPart ? `${grouped}.${decPart}` : grouped;
  return `Tk. ${num}`;
}

function paymentMethodLabel(method) {
  const map = {
    cash: "Cash",
    bkash_manual: "Manual bKash",
    manual_bkash: "Manual bKash",
    bkash_online: "bKash Online",
    sslcommerz_online: "SSL Commerz",
    sslcommerz: "SSL Commerz",
    bkash: "bKash",
  };
  return map[String(method || "").toLowerCase()] || method || "—";
}

function billToLines(order, customer = {}) {
  const ship = order?.shippingAddress || {};
  const name =
    ship.fullName?.trim() ||
    customer.name?.trim() ||
    customer.displayName?.trim() ||
    "Customer";
  const lines = [name];
  if (ship.phone) lines.push(`Phone: ${ship.phone}`);
  if (customer.email) lines.push(`Email: ${customer.email}`);
  const addr = [ship.line1, ship.line2, ship.union, ship.upazila, ship.city, ship.district]
    .filter(Boolean)
    .join(", ");
  if (addr) lines.push(addr);
  return lines;
}

function collectLineItems(order) {
  const rows = [];
  for (const item of order?.items || []) {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    rows.push({
      title: item.title || "Product",
      qty,
      unit: price,
      total: price * qty,
    });
  }
  return rows;
}

/**
 * Generate and download a PDF invoice for a paid order.
 * @param {object} order — order document (may be nested under payment.orderId)
 * @param {object|null} payment — optional payment record for TXN details
 * @param {{ name?: string, email?: string, displayName?: string }} customer
 */
export function downloadOrderInvoice(order, payment = null, customer = {}) {
  if (!order) {
    throw new Error("Order is required");
  }

  const isPaid = String(order.paymentStatus || "").toLowerCase() === "paid";
  if (!isPaid) {
    throw new Error("Invoice is available only for paid orders");
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = margin;

  const accent = [5, 150, 105];
  const muted = [100, 116, 139];
  const text = [15, 23, 42];

  doc.setFillColor(...accent);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(COMPANY_LEGAL_NAME, margin, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(COMPANY_NAME, margin, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("INVOICE", pageW - margin, 14, { align: "right" });

  y = 38;
  doc.setTextColor(...text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Invoice #${order.orderNo || order._id}`, margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Date: ${formatDate(payment?.completedAt || payment?.createdAt || order.completedAt || order.createdAt)}`, margin, y + 6);
  doc.text(`Order status: ${order.status || "—"}`, margin, y + 12);
  doc.text(`Payment: ${order.paymentStatus || "—"}`, pageW - margin, y + 6, { align: "right" });

  y += 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Bill to", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  billToLines(order, customer).forEach((line) => {
    doc.text(line, margin, y);
    y += 4.5;
  });

  y += 6;
  const colX = {
    item: margin,
    qty: pageW - margin - 52,
    unit: pageW - margin - 36,
    total: pageW - margin - 8,
  };

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y - 4, pageW - margin * 2, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("Item", colX.item, y);
  doc.text("Qty", colX.qty, y, { align: "right" });
  doc.text("Unit", colX.unit, y, { align: "right" });
  doc.text("Total", colX.total, y, { align: "right" });

  y += 8;
  doc.setTextColor(...text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const lineItems = collectLineItems(order);
  if (!lineItems.length) {
    doc.text("No line items", margin, y);
    y += 8;
  } else {
    for (const row of lineItems) {
      if (y > 250) {
        doc.addPage();
        y = margin;
      }
      const titleLines = doc.splitTextToSize(row.title, colX.qty - colX.item - 4);
      doc.text(titleLines, colX.item, y);
      const rowH = Math.max(6, titleLines.length * 4.5);
      doc.text(String(row.qty), colX.qty, y, { align: "right" });
      doc.text(formatMoney(row.unit), colX.unit, y, { align: "right" });
      doc.text(formatMoney(row.total), colX.total, y, { align: "right" });
      if (row.note) {
        doc.setFontSize(7);
        doc.setTextColor(...muted);
        doc.text(row.note, colX.item, y + 4);
        doc.setFontSize(9);
        doc.setTextColor(...text);
      }
      y += rowH + (row.note ? 4 : 2);
    }
  }

  y += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total", pageW - margin - 45, y);
  doc.text(formatMoney(order.totalAmount), colX.total, y, { align: "right" });

  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  const method = payment?.paymentMethod || order.paymentMethod;
  if (method) {
    doc.text(`Payment method: ${paymentMethodLabel(method)}`, margin, y);
    y += 5;
  }
  const txn = payment?.transactionId || payment?.paymentID;
  if (txn) {
    doc.text(`Transaction ID: ${txn}`, margin, y);
    y += 5;
  }
  if (payment?.paymentID && payment?.transactionId && payment.paymentID !== payment.transactionId) {
    doc.text(`Payment ID: ${payment.paymentID}`, margin, y);
    y += 5;
  }

  y = 275;
  doc.setFontSize(8);
  doc.text("Thank you for your purchase.", margin, y);
  doc.text(`${COMPANY_LEGAL_NAME} · ${COMPANY_NAME}`, margin, y + 5);

  const slug = companyNameSlug();
  const no = order.orderNo || String(order._id || "order").slice(-8);
  doc.save(`${slug}-invoice-${no}.pdf`);
}
