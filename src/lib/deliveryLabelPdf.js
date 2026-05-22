import { jsPDF } from "jspdf";
import { formatShippingAddrForLabel } from "./shippingAddressUtils";

/** Standard A4 sheet: 3 × 7 labels (70 × 40 mm) */
export const DELIVERY_LABEL_MM = {
  width: 70,
  height: 40,
  cols: 3,
  rows: 7,
  padding: 2.5,
  headerH: 7,
};

const LABELS_PER_PAGE =
  DELIVERY_LABEL_MM.cols * DELIVERY_LABEL_MM.rows;

const BRAND = {
  fill: [5, 150, 105],
  border: [203, 213, 225],
  muted: [100, 116, 139],
  text: [15, 23, 42],
};

function formatLabelDate(dateValue) {
  if (!dateValue) return "—";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function drawFieldRow(doc, innerX, innerW, cursorY, label, value, maxY, lineGap = 3.4) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  const labelText = `${label}:`;
  doc.text(labelText, innerX, cursorY);

  doc.setFont("helvetica", "normal");
  const labelW = doc.getTextWidth(`${labelText} `);
  const wrapped = doc.splitTextToSize(String(value), innerW - labelW);

  let y = cursorY;
  wrapped.forEach((line, i) => {
    if (y > maxY) return;
    doc.text(line, innerX + (i === 0 ? labelW : 0), y);
    y += lineGap;
  });

  return y + 0.6;
}

function drawAddrBlock(doc, innerX, innerW, cursorY, ship, maxY) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("ADDR:", innerX, cursorY);
  cursorY += 3.2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const addr = formatShippingAddrForLabel(ship);
  const wrapped = doc.splitTextToSize(addr, innerW);
  const lineGap = 3.2;

  wrapped.forEach((line) => {
    if (cursorY > maxY) return;
    doc.text(line, innerX, cursorY);
    cursorY += lineGap;
  });

  return cursorY + 0.4;
}

/**
 * Draw one shipping label at (x, y) in mm.
 */
export function drawDeliveryLabel(doc, x, y, order, companyName = "QR Tag") {
  const { width: w, height: h, padding: pad, headerH } = DELIVERY_LABEL_MM;
  const ship = order?.shippingAddress || {};
  const innerX = x + pad;
  const innerW = w - pad * 2;
  const maxY = y + h - pad - 2.5;
  const footerY = y + h - pad;

  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.2);
  doc.rect(x, y, w, h);

  doc.setFillColor(...BRAND.fill);
  doc.rect(x, y, w, headerH, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(String(companyName).toUpperCase().slice(0, 22), innerX, y + 4.2);
  doc.setFontSize(6);
  doc.text("DELIVERY", x + w - pad, y + 4.2, { align: "right" });

  doc.setTextColor(...BRAND.text);

  const orderY = y + headerH + 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`#${order?.orderNo || "—"}`, innerX, orderY);

  const dividerY = orderY + 5.5;
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.12);
  doc.line(innerX, dividerY, innerX + innerW, dividerY);

  let cursorY = dividerY + 3;

  cursorY = drawFieldRow(
    doc,
    innerX,
    innerW,
    cursorY,
    "TO",
    ship.fullName || "—",
    maxY
  );
  cursorY = drawFieldRow(
    doc,
    innerX,
    innerW,
    cursorY,
    "TEL",
    ship.phone || "—",
    maxY
  );
  drawAddrBlock(doc, innerX, innerW, cursorY, ship, maxY);

  doc.setTextColor(...BRAND.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text(formatLabelDate(order?.createdAt), innerX, footerY);
  doc.text("Handle with care", x + w - pad, footerY, { align: "right" });
}

/**
 * @param {Array<Record<string, unknown>>} orders
 * @param {{ companyName?: string }} [options]
 */
export function buildDeliveryLabelsPdf(orders, options = {}) {
  const companyName = options.companyName || "QR Tag";
  const list = Array.isArray(orders) ? orders : [];

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const { width: labelW, height: labelH, cols } = DELIVERY_LABEL_MM;

  list.forEach((order, index) => {
    if (index > 0 && index % LABELS_PER_PAGE === 0) doc.addPage();

    const slot = index % LABELS_PER_PAGE;
    const col = slot % cols;
    const row = Math.floor(slot / cols);
    drawDeliveryLabel(doc, col * labelW, row * labelH, order, companyName);
  });

  if (list.length === 0) {
    doc.setFontSize(12);
    doc.text("No orders to print.", 20, 40);
  }

  return doc;
}

export function deliveryLabelsFilename(options = {}) {
  const from = options.fromDate || "all";
  const to = options.toDate || "all";
  return `delivery-labels-${from}-${to}.pdf`;
}
