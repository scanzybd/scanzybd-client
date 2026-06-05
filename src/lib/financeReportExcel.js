import * as XLSX from "xlsx";
import { formatOrderKind } from "./orderDisplayFormat";

function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB");
  } catch {
    return "";
  }
}

function fmtMoney(n) {
  return Number(n || 0);
}

function orderSalesRow(o, includeMonth) {
  const base = [
    fmtDate(o.createdAt),
    o.orderNo || "",
    formatOrderKind(o.orderKind),
    fmtMoney(o.totalAmount),
    o.paymentMethod || "",
    o.paymentStatus || "paid",
    o.status || "",
    o.providerName || o.providerEmail || "",
  ];
  if (includeMonth) {
    return [o.monthLabel || "", ...base];
  }
  return base;
}

/**
 * Build .xlsx workbook from admin finance report API payload.
 */
export function downloadFinanceReportExcel(report) {
  if (!report) return;

  const wb = XLSX.utils.book_new();
  const { period, summary } = report;
  const isYearly = period?.type === "yearly";

  const summaryRows = [
    ["Finance Report", period?.label || ""],
    ["Period type", period?.type || ""],
    ["From", fmtDate(period?.from)],
    ["To", fmtDate(period?.to)],
    [],
    ["Metric", "Amount (BDT)", "Count"],
    ["Total sales (paid orders)", fmtMoney(summary?.totalIncome), summary?.orderCount ?? 0],
    ["All orders (any status)", "", summary?.allOrderCount ?? report.allOrders?.length ?? 0],
    ["Total expenses", fmtMoney(summary?.totalExpenses), summary?.expenseCount ?? 0],
    ["Provider settlements paid", fmtMoney(summary?.settlementsPaid), summary?.settlementCount ?? 0],
    ["Net profit (sales − expenses)", fmtMoney(summary?.netProfit), ""],
  ];

  if (Array.isArray(report.incomeByKind) && report.incomeByKind.length > 0) {
    summaryRows.push([], ["Sales by order type", "Amount", "Count"]);
    for (const row of report.incomeByKind) {
      summaryRows.push([formatOrderKind(row.key), fmtMoney(row.total), row.count]);
    }
  }

  if (Array.isArray(report.expensesByCategory) && report.expensesByCategory.length > 0) {
    summaryRows.push([], ["Expenses by category", "Amount", "Count"]);
    for (const row of report.expensesByCategory) {
      summaryRows.push([row.key, fmtMoney(row.total), row.count]);
    }
  }

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), "Summary");

  if (Array.isArray(report.monthlyBreakdown) && report.monthlyBreakdown.length > 0) {
    const monthlyHeader = [
      "Month",
      "Sales (paid)",
      "Expenses",
      "Settlements",
      "Net",
      "Paid orders",
      "All orders",
      "Expense entries",
    ];
    const monthlyRows = report.monthlyBreakdown.map((m) => [
      m.label,
      fmtMoney(m.totalSales ?? m.totalIncome),
      fmtMoney(m.totalExpenses),
      fmtMoney(m.settlementsPaid),
      fmtMoney(m.netProfit),
      m.orderCount ?? 0,
      m.allOrderCount ?? "",
      m.expenseCount ?? 0,
    ]);
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([monthlyHeader, ...monthlyRows]),
      "Monthly Summary"
    );
  }

  const monthlyOrdersHeader = isYearly
    ? [
        "Month",
        "Date",
        "Order",
        "Type",
        "Amount",
        "Payment",
        "Payment status",
        "Order status",
        "Provider",
      ]
    : ["Date", "Order", "Type", "Amount", "Payment", "Payment status", "Order status", "Provider"];

  const monthlyOrderRows = [];
  const orderBlocks = report.monthlyOrders || report.monthlySales || [];

  for (const block of orderBlocks) {
    const count = block.orderCount ?? block.orders?.length ?? 0;
    const paid = block.paidCount ?? 0;
    if (count > 0) {
      monthlyOrderRows.push([
        isYearly ? block.label : "",
        "",
        "",
        `— ${count} order(s) (${paid} paid)`,
        fmtMoney(block.totalAmount ?? block.totalSales),
        "",
        "",
        "",
        "",
      ]);
    }
    for (const o of block.orders || []) {
      monthlyOrderRows.push(orderSalesRow(o, isYearly));
    }
    if (count > 0) {
      monthlyOrderRows.push([]);
    }
  }

  if (monthlyOrderRows.length === 0 && Array.isArray(report.allOrders)) {
    for (const o of report.allOrders) {
      monthlyOrderRows.push(orderSalesRow(o, isYearly));
    }
  }

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([monthlyOrdersHeader, ...monthlyOrderRows]),
    "Monthly Orders"
  );

  const allOrdersHeader = isYearly
    ? [
        "Month",
        "Date",
        "Order",
        "Type",
        "Amount",
        "Payment",
        "Payment status",
        "Order status",
        "Provider",
      ]
    : [
        "Date",
        "Order",
        "Type",
        "Amount",
        "Payment",
        "Payment status",
        "Order status",
        "Provider",
      ];

  const allOrderRows = (report.allOrders || report.orders || []).map((o) => {
    const row = [
      fmtDate(o.createdAt),
      o.orderNo || "",
      formatOrderKind(o.orderKind),
      fmtMoney(o.totalAmount),
      o.paymentMethod || "",
      o.paymentStatus || "",
      o.status || "",
      o.providerName || o.providerEmail || "",
    ];
    if (isYearly) {
      return [o.monthLabel || "", ...row];
    }
    return row;
  });

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([allOrdersHeader, ...allOrderRows]),
    "All Orders"
  );

  const expenseHeader = ["Date", "Title", "Category", "Amount", "Note", "Created by"];
  const expenseRows = (report.expenses || []).map((e) => [
    fmtDate(e.createdAt),
    e.title || "",
    e.category || "",
    fmtMoney(e.amount),
    e.note || "",
    e.createdBy || "",
  ]);
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([expenseHeader, ...expenseRows]),
    "Expenses"
  );

  const settlementHeader = [
    "Reviewed",
    "Provider",
    "Period from",
    "Period to",
    "Amount",
    "Orders",
  ];
  const settlementRows = (report.settlements || []).map((s) => [
    fmtDate(s.reviewedAt),
    s.providerName || s.providerEmail || "",
    fmtDate(s.periodFrom),
    fmtDate(s.periodTo),
    fmtMoney(s.amount),
    s.orderCount ?? 0,
  ]);
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([settlementHeader, ...settlementRows]),
    "Settlements"
  );

  const safeLabel = String(period?.label || "report").replace(/[^\w.-]+/g, "_");
  const filename = `finance-report-${safeLabel}.xlsx`;
  XLSX.writeFile(wb, filename);
}
