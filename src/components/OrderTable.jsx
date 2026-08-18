import React, { useMemo, useState } from "react";
import SmartLoader from "./SmartLoader";
import { cardSurface, textHeading, textMuted } from "../lib/uiClasses";
import {
  formatShippingAddrMain,
  formatShippingLine1Details,
} from "../lib/shippingAddressUtils";
import OrderFulfillmentTags from "./order/OrderFulfillmentTags";
import { productImageUrl } from "../lib/productImages";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50",
  shipped: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/50",
  delivered: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-900/50",
  returned: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900/50",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/50",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50",
};

const paymentStyles = {
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50",
  unpaid: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/50",
  pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50",
};

const OrderTable = ({
  title,
  orders = [],
  isLoading = false,
  statusOptions = [],
  summaryCards = [],
  onStatusUpdate,
  statusUpdatingId = "",
  showFulfillment = false,
}) => {
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
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600";

  const getPaymentClass = (status) =>
    paymentStyles[String(status || "").toLowerCase()] ||
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600";

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const customerBlock = (order) => {
    const ship = order?.shippingAddress || {};
    const user = order?.userId;
    const addr = formatShippingAddrMain(ship);
    const line1 = formatShippingLine1Details(ship);

    return {
      name: ship.fullName || user?.name || "—",
      phone: ship.phone || "—",
      email: user?.email || "—",
      addr,
      line1,
    };
  };

  const selectedOrCurrentStatus = (order) =>
    statusSelection[order?._id] || String(order?.status || "").toLowerCase();

  const defaultSummaryCards = [
    { label: "Total Orders", value: totalOrders, valueClass: "text-slate-900 dark:text-slate-100" },
    { label: "Revenue", value: `৳ ${totalRevenue.toLocaleString()}`, valueClass: "text-slate-900 dark:text-slate-100" },
    { label: "Paid", value: paidOrders, valueClass: "text-emerald-600 dark:text-emerald-400" },
    { label: "Pending", value: pendingOrders, valueClass: "text-amber-600 dark:text-amber-400" },
    { label: "Confirmed", value: confirmedOrders, valueClass: "text-emerald-600 dark:text-emerald-400" },
    { label: "Shipped", value: shippedOrders, valueClass: "text-sky-600 dark:text-sky-400" },
    { label: "Delivered", value: deliveredOrders, valueClass: "text-teal-600 dark:text-teal-400" },
    { label: "Returned", value: returnedOrders, valueClass: "text-orange-600 dark:text-orange-400" },
  ];

  const cardsToRender =
    Array.isArray(summaryCards) && summaryCards.length > 0 ? summaryCards : defaultSummaryCards;

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className={`${cardSurface} p-6`}>
        <h2 className={`mb-3 text-xl font-bold md:text-2xl ${textHeading}`}>{title}</h2>
        <p className={textMuted}>No orders found.</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className={`${cardSurface} p-5`}>
        <h2 className={`text-xl font-bold md:text-2xl ${textHeading}`}>{title}</h2>
        <p className={`mt-1 text-sm ${textMuted}`}>
          Manage and track order status and payment updates.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {cardsToRender.map((card) => (
          <div key={card.label} className={`${cardSurface} p-4`}>
            <p className={`text-xs uppercase tracking-wide ${textMuted}`}>{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.valueClass || "text-slate-900 dark:text-slate-100"}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {safeOrders.map((order) => {
          const customer = customerBlock(order);
          const items = Array.isArray(order?.items) ? order.items : [];
          const tags = Array.isArray(order?.tagAssignments) ? order.tagAssignments : [];

          return (
          <article
            key={order._id}
            className={`${cardSurface} overflow-hidden transition hover:shadow-md`}
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>
                  Order ID
                </p>
                <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  {order?.orderNo || "—"}
                </p>
                <p className={`mt-0.5 text-xs ${textMuted}`}>
                  {formatDate(order?.createdAt)}
                  {order?._id ? (
                    <span className="ml-2 hidden font-mono text-[10px] sm:inline">
                      · {String(order._id).slice(-8)}
                    </span>
                  ) : null}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-lg bg-white px-3 py-1.5 shadow-sm dark:bg-slate-900">
                  <p className={`text-[10px] ${textMuted}`}>Total</p>
                  <p className={`text-sm font-bold ${textHeading}`}>
                    ৳ {Number(order?.totalAmount || 0).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getPaymentClass(
                    order?.paymentStatus
                  )}`}
                >
                  {order?.paymentStatus || "unknown"}
                </span>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusClass(
                    order?.status
                  )}`}
                >
                  {order?.status || "unknown"}
                </span>
              </div>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Customer details
                </h3>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 font-medium text-slate-500 dark:text-slate-400">Name</dt>
                    <dd className={textHeading}>{customer.name}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 font-medium text-slate-500 dark:text-slate-400">Phone</dt>
                    <dd className="font-mono text-slate-800 dark:text-slate-200">{customer.phone}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 font-medium text-slate-500 dark:text-slate-400">Email</dt>
                    <dd className="break-all text-slate-800 dark:text-slate-200">{customer.email}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 font-medium text-slate-500 dark:text-slate-400">Addr</dt>
                    <dd className="text-slate-800 dark:text-slate-200">
                      {customer.addr}
                      {customer.line1 ? (
                        <span className="text-slate-600 dark:text-slate-400">
                          {" "}
                          ({customer.line1})
                        </span>
                      ) : null}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Order details
                </h3>
                {items.length === 0 ? (
                  <p className={`text-sm ${textMuted}`}>No line items.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                    {items.map((item, idx) => (
                      <li
                        key={`${item.productId || idx}-${idx}`}
                        className="flex gap-2 py-2 first:pt-0 last:pb-0"
                      >
                        {item.image ? (
                          <img
                            src={productImageUrl(item.image, "cart")}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-600"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] text-slate-400 dark:bg-slate-800">
                            —
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                            {item.title || "Product"}
                          </p>
                          <p className={`text-xs ${textMuted}`}>
                            Qty {Number(item.quantity) || 1} × ৳{" "}
                            {Number(item.price || 0).toLocaleString()} = ৳{" "}
                            {(
                              (Number(item.price) || 0) * (Number(item.quantity) || 1)
                            ).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {!showFulfillment && tags.length > 0 && (
                  <p className={`border-t border-slate-100 pt-2 text-xs ${textMuted} dark:border-slate-700`}>
                    {tags.length} tag{tags.length === 1 ? "" : "s"} assigned
                  </p>
                )}
              </div>
            </div>

            {showFulfillment && tags.length > 0 ? (
              <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-700">
                <OrderFulfillmentTags order={order} />
              </div>
            ) : null}

            {hasStatusEditor && (
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-3 dark:border-slate-700">
                <select
                  className="select select-bordered select-sm w-full max-w-[220px] border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
          );
        })}
      </div>
    </section>
  );
};

export default OrderTable;
