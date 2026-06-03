import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, Eye, FileText, Printer, RotateCcw, X } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import OrderTable from "../../../components/OrderTable";
import { COMPANY_NAME } from "../../../config/company";
import {
  buildDeliveryLabelsPdf,
  DELIVERY_LABEL_MM,
  deliveryLabelsFilename,
} from "../../../lib/deliveryLabelPdf";
import {
  formatOrderPlateNumbers,
  formatOrderTagTypes,
} from "../../../lib/orderPrintTableUtils";

const ConfirmedOrder = () => {
  const axiosSecure = useAxiosSecure();
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";
  const queryClient = useQueryClient();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [labelPreviewUrl, setLabelPreviewUrl] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["confirmed-orders", fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const query = params.toString();
      const res = await axiosSecure.get(`/api/order/completed${query ? `?${query}` : ""}`);
      return res.data;
    },
  });

  const safeOrders = useMemo(
    () => (Array.isArray(orders) ? orders : []),
    [orders]
  );

  const { mutateAsync: mutateStatus, isPending: isStatusUpdating, variables } = useMutation({
    mutationFn: async ({ orderId, status }) =>
      axiosSecure.patch(`/api/order/${orderId}/status`, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["confirmed-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["shipped-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["returned-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["delivered-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["all-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["order-reports"] });
    },
  });

  const handleResetFilter = () => {
    setFromDate("");
    setToDate("");
  };

  const handlePrintOrders = () => {
    window.print();
  };

  const printDateLabel = useMemo(() => {
    if (fromDate && toDate) return `${fromDate} — ${toDate}`;
    if (fromDate) return `From ${fromDate}`;
    if (toDate) return `Until ${toDate}`;
    return "All dates";
  }, [fromDate, toDate]);

  const formatPrintDate = (dateValue) => {
    if (!dateValue) return "—";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const buildLabelPdf = () =>
    buildDeliveryLabelsPdf(safeOrders, { companyName: COMPANY_NAME });

  const labelCount = safeOrders.length;
  const labelsPerSheet = DELIVERY_LABEL_MM.cols * DELIVERY_LABEL_MM.rows;
  const sheetCount = Math.max(1, Math.ceil(labelCount / labelsPerSheet) || 1);

  const handlePreviewLabels = () => {
    if (labelPreviewUrl) URL.revokeObjectURL(labelPreviewUrl);
    const pdf = buildLabelPdf();
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    setLabelPreviewUrl(url);
  };

  const handleDownloadLabels = () => {
    const pdf = buildLabelPdf();
    pdf.save(
      deliveryLabelsFilename({ fromDate: fromDate || "all", toDate: toDate || "all" })
    );
  };

  const handlePrintLabels = () => {
    const iframe = document.getElementById("delivery-label-preview-frame");
    iframe?.contentWindow?.print();
  };

  const closePreview = () => {
    if (labelPreviewUrl) URL.revokeObjectURL(labelPreviewUrl);
    setLabelPreviewUrl("");
  };

  const handleStatusUpdate = async (order, status) => {
    await mutateStatus({ orderId: order?._id, status });
  };

  return (
    <section className="confirmed-orders-page space-y-4">
      <style>{`
        .confirmed-print-sheet {
          position: fixed;
          left: -10000px;
          top: 0;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .confirmed-print-sheet,
          .confirmed-print-sheet * {
            visibility: visible;
          }
          .confirmed-print-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            overflow: visible;
            padding: 12mm;
            background: #fff;
            color: #000;
          }
          .confirmed-print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          .confirmed-print-table th,
          .confirmed-print-table td {
            border: 1px solid #333;
            padding: 4px 6px;
            text-align: left;
            vertical-align: top;
          }
          .confirmed-print-table th {
            background: #f0f0f0;
            font-weight: 700;
          }
          .confirmed-print-table tr:nth-child(even) td {
            background: #fafafa;
          }
        }
      `}</style>

      <div className="no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">From Date</span>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full dark:border-slate-600 dark:bg-slate-800"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">To Date</span>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full dark:border-slate-600 dark:bg-slate-800"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </label>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline gap-1.5"
              onClick={handleResetFilter}
              disabled={!fromDate && !toDate}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset filter
            </button>
          </div>
          {isAdmin && (
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Labels: {DELIVERY_LABEL_MM.width}×{DELIVERY_LABEL_MM.height} mm ·{" "}
                {DELIVERY_LABEL_MM.cols}×{DELIVERY_LABEL_MM.rows} per A4
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm gap-1.5"
                  onClick={handlePrintOrders}
                  disabled={safeOrders.length === 0}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print orders (table)
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary gap-1.5"
                  onClick={handlePreviewLabels}
                  disabled={safeOrders.length === 0}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview labels
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-accent gap-1.5"
                  onClick={handleDownloadLabels}
                  disabled={safeOrders.length === 0}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print-only: filtered orders as table */}
      <div className="confirmed-print-sheet" aria-hidden="true">
        <header style={{ marginBottom: "12px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Confirmed Orders</h1>
          <p style={{ fontSize: "11px", margin: "4px 0 0" }}>Date range: {printDateLabel}</p>
          <p style={{ fontSize: "11px", margin: "2px 0 0" }}>
            Printed: {new Date().toLocaleString()} · Total: {safeOrders.length} order(s)
          </p>
        </header>
        <table className="confirmed-print-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Order No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Plate no.</th>
              <th>Tag type</th>
              <th>City</th>
              <th>District</th>
              <th>Address</th>
              <th>Amount (৳)</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {safeOrders.map((order, index) => {
              const ship = order?.shippingAddress || {};
              return (
                <tr key={order._id || index}>
                  <td>{index + 1}</td>
                  <td>{order?.orderNo || "—"}</td>
                  <td>{formatPrintDate(order?.createdAt)}</td>
                  <td>{ship.fullName || "—"}</td>
                  <td>{ship.phone || "—"}</td>
                  <td>{formatOrderPlateNumbers(order)}</td>
                  <td>{formatOrderTagTypes(order)}</td>
                  <td>{ship.city || "—"}</td>
                  <td>{ship.district || "—"}</td>
                  <td>{[ship.line1, ship.line2].filter(Boolean).join(", ") || "—"}</td>
                  <td>{Number(order?.totalAmount || 0).toLocaleString()}</td>
                  <td>{order?.paymentStatus || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="no-print">
      <OrderTable
        title="Confirmed Orders"
        orders={safeOrders}
        isLoading={isLoading}
        showFulfillment
        statusOptions={isAdmin ? ["confirmed", "shipped", "delivered", "returned", "cancelled"] : []}
        onStatusUpdate={isAdmin ? handleStatusUpdate : undefined}
        statusUpdatingId={isAdmin && isStatusUpdating ? variables?.orderId || "" : ""}
      />
      </div>

      {isAdmin && labelPreviewUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6">
          <div className="flex h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800/80">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Delivery labels
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {labelCount} label{labelCount === 1 ? "" : "s"} · {sheetCount} A4 sheet
                    {sheetCount === 1 ? "" : "s"} · {printDateLabel}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm gap-1.5"
                  onClick={handlePrintLabels}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary gap-1.5"
                  onClick={handleDownloadLabels}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost btn-square"
                  onClick={closePreview}
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-200/80 p-2 dark:bg-slate-950">
              <iframe
                id="delivery-label-preview-frame"
                title="Delivery Label Preview"
                src={labelPreviewUrl}
                className="h-full w-full rounded-lg border border-slate-300 bg-white shadow-inner dark:border-slate-600"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ConfirmedOrder;
