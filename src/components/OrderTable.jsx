import React from "react";
import SmartLoader from "./SmartLoader";

const OrderTable = ({ title, orders = [], isLoading = false }) => {
  const statusStyles = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalOrders}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Revenue</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">৳ {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Paid</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{paidOrders}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{pendingOrders}</p>
        </div>
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
          </article>
        ))}
      </div>
    </section>
  );
};

export default OrderTable;