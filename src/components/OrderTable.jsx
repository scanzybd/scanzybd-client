import React, { useMemo, useState } from "react";
import SmartLoader from "./SmartLoader";

const OrderTable = ({
  title,
  orders = [],
  isLoading = false,
  statusOptions = [],
  summaryCards = [],
  onStatusUpdate,
  statusUpdatingId = "",
}) => {
  const statusStyles = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    shipped: "bg-sky-100 text-sky-700 border-sky-200",
    delivered: "bg-teal-100 text-teal-700 border-teal-200",
    returned: "bg-orange-100 text-orange-700 border-orange-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const paymentStyles = {
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    unpaid: "bg-rose-100 text-rose-700 border-rose-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
  };

  if (isLoading) {
    return <SmartLoader label={`Loading ${title.toLowerCase()}...`} />;
  }

  const safeOrders = Array.isArray(orders) ? orders : [];
  const hasStatusEditor = Array.isArray(statusOptions) && statusOptions.length > 0 && typeof onStatusUpdate === "function";
  const [statusSelection, setStatusSelection] = useState({});
  const normalizedOptions = useMemo(
    () => statusOptions.map((s) => String(s || "").toLowerCase()).filter(Boolean),
    [statusOptions]
  );
  const totalOrders = safeOrders.length;
  const totalRevenue = safeOrders.reduce(
    (sum, order) => sum + Number(order?.totalAmount || 0),
    0
  );
  const paidOrders = safeOrders.filter(
    (order) => order?.paymentStatus === "paid"
  ).length;
  const pendingOrders = safeOrders.filter(
    (order) => order?.status === "pending"
  ).length;
  const confirmedOrders = safeOrders.filter(
    (order) => ["confirmed", "paid"].includes(String(order?.status || "").toLowerCase())
  ).length;
  const shippedOrders = safeOrders.filter(
    (order) => String(order?.status || "").toLowerCase() === "shipped"
  ).length;
  const deliveredOrders = safeOrders.filter(
    (order) => String(order?.status || "").toLowerCase() === "delivered"
  ).length;
  const returnedOrders = safeOrders.filter(
    (order) => String(order?.status || "").toLowerCase() === "returned"
  ).length;

  const getStatusClass = (status) =>
    statusStyles[String(status || "").toLowerCase()] ||
    "bg-slate-100 text-slate-700 border-slate-200";

  const getPaymentClass = (status) =>
    paymentStyles[String(status || "").toLowerCase()] ||
    "bg-slate-100 text-slate-700 border-slate-200";

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  };

  const selectedOrCurrentStatus = (order) =>
    statusSelection[order?._id] || String(order?.status || "").toLowerCase();

  const defaultSummaryCards = [
    { label: "Total Orders", value: totalOrders, valueClass: "text-slate-900" },
    { label: "Revenue", value: `৳ ${totalRevenue.toLocaleString()}`, valueClass: "text-slate-900" },
    { label: "Paid", value: paidOrders, valueClass: "text-emerald-600" },
    { label: "Pending", value: pendingOrders, valueClass: "text-amber-600" },
    { label: "Confirmed", value: confirmedOrders, valueClass: "text-emerald-600" },
    { label: "Shipped", value: shippedOrders, valueClass: "text-sky-600" },
    { label: "Delivered", value: deliveredOrders, valueClass: "text-teal-600" },
    { label: "Returned", value: returnedOrders, valueClass: "text-orange-600" },
  ];

  const cardsToRender =
    Array.isArray(summaryCards) && summaryCards.length > 0 ? summaryCards : defaultSummaryCards;

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-xl font-bold text-slate-900 md:text-2xl">{title}</h2>
        <p className="text-slate-500">No orders found.</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 md:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage and track order status and payment updates.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {cardsToRender.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.valueClass || "text-slate-900"}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {safeOrders.map((order) => (
          <article
            key={order._id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Order ID
                </p>
                <p className="break-all text-sm font-semibold text-slate-800">
                  {order?._id}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Date:</span>{" "}
                  {formatDate(order?.createdAt)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:items-center md:gap-3">
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="font-bold text-slate-900">৳ {Number(order?.totalAmount || 0).toLocaleString()}</p>
                </div>

                <span
                  className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getPaymentClass(
                    order?.paymentStatus
                  )}`}
                >
                  {order?.paymentStatus || "unknown"}
                </span>

                <span
                  className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusClass(
                    order?.status
                  )}`}
                >
                  {order?.status || "unknown"}
                </span>
              </div>
            </div>

            {hasStatusEditor && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <select
                  className="select select-bordered select-sm w-full max-w-[220px]"
                  value={selectedOrCurrentStatus(order)}
                  onChange={(e) =>
                    setStatusSelection((prev) => ({
                      ...prev,
                      [order._id]: e.target.value,
                    }))
                  }
                >
                  {normalizedOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => onStatusUpdate(order, selectedOrCurrentStatus(order))}
                  disabled={
                    statusUpdatingId === order?._id ||
                    !normalizedOptions.includes(selectedOrCurrentStatus(order))
                  }
                >
                  {statusUpdatingId === order?._id ? "Updating..." : "Update Status"}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default OrderTable;