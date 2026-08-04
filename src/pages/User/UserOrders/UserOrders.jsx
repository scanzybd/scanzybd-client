import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Package,
  ShoppingBag,
  Tag,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";
import InvoiceDownloadButton from "../../../components/InvoiceDownloadButton";
import InfoRow from "../../../components/order/InfoRow";
import {
  formatBdt,
  formatDateShort,
  formatDateTime,
  formatOrderNo,
  formatPaymentMethod,
  formatStatusLabel,
} from "../../../lib/orderDisplayFormat";
import { formatShippingAddr } from "../../../lib/shippingAddressUtils";
import { cardSurface } from "../../../lib/uiClasses";

function hasShipping(ship = {}) {
  return Boolean(
    ship?.fullName ||
      ship?.phone ||
      ship?.line1 ||
      ship?.union ||
      ship?.upazila ||
      ship?.city
  );
}

function orderSummaryLine(order) {
  const itemCount = (order.items || []).reduce(
    (n, i) => n + (Number(i.quantity) || 1),
    0
  );
  const tagCount = order.tagAssignments?.length ?? 0;
  const parts = [];
  if (itemCount) parts.push(`${itemCount} item${itemCount !== 1 ? "s" : ""}`);
  if (tagCount) parts.push(`${tagCount} tag${tagCount !== 1 ? "s" : ""}`);
  return parts.length ? parts.join(" · ") : "No line items";
}

/** Payment badge — manual bKash unpaid orders are awaiting admin review */
function paymentBadge(order) {
  const status = String(order.paymentStatus || "").toLowerCase();
  const method = String(order.paymentMethod || "").toLowerCase();

  if (status === "paid") {
    return {
      label: "Paid",
      className:
        "bg-emerald-100 text-emerald-800 ring-emerald-200/80 dark:bg-emerald-900/40 dark:text-emerald-300",
    };
  }
  if (status === "failed") {
    return {
      label: "Failed",
      className:
        "bg-rose-100 text-rose-800 ring-rose-200/80 dark:bg-rose-900/40 dark:text-rose-300",
    };
  }
  if (method === "manual_bkash") {
    return {
      label: "Pending verification",
      className:
        "bg-amber-100 text-amber-800 ring-amber-200/80 dark:bg-amber-900/40 dark:text-amber-300",
    };
  }
  return {
    label: "Unpaid",
    className:
      "bg-slate-100 text-slate-700 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-300",
  };
}

function OrderDetailsPanel({ order, customer }) {
  const ship = order.shippingAddress || {};
  const items = order.items || [];
  const tags = order.tagAssignments || [];

  return (
    <div className="border-t border-slate-200/80 bg-slate-50/90 px-4 py-5 dark:border-slate-700 dark:bg-slate-800/50 sm:px-6">
      <div className="mb-5 rounded-xl border border-slate-200/80 bg-white px-3 dark:border-slate-600 dark:bg-slate-900/60">
        <InfoRow label="Order no." value={formatOrderNo(order.orderNo)} />
        <InfoRow label="Placed on" value={formatDateTime(order.createdAt)} />
        <InfoRow label="Order status" value={formatStatusLabel(order.status)} />
        <InfoRow label="Payment status" value={formatStatusLabel(order.paymentStatus)} />
        <InfoRow label="Payment method" value={formatPaymentMethod(order.paymentMethod)} />
        {order.completedAt && (
          <InfoRow label="Completed on" value={formatDateTime(order.completedAt)} />
        )}
      </div>

      {items.length > 0 && (
        <section className="mb-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            Products
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900/60">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/80">
                  <th className="px-4 py-2.5 font-semibold">Product</th>
                  <th className="px-3 py-2.5 text-center font-semibold">Qty</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Price</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {items.map((item, i) => {
                  const qty = Number(item.quantity) || 1;
                  const price = Number(item.price) || 0;
                  const lineTotal = price * qty;
                  return (
                    <tr key={i} className="text-slate-700 dark:text-slate-300">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-600"
                            />
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
                              <Package className="h-5 w-5" />
                            </span>
                          )}
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {item.title || "Product"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center tabular-nums">{qty}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                        {formatBdt(price)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatBdt(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-emerald-50/50 dark:border-slate-600 dark:bg-emerald-950/20">
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Order total
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-base font-bold text-emerald-700 dark:text-emerald-400">
                    {formatBdt(order.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {tags.length > 0 && (
        <section className="mb-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <Tag className="h-4 w-4 text-emerald-600" />
            QR tags
          </h3>
          <ul className="space-y-2">
            {tags.map((t, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900/60"
              >
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {t.productTitle || "QR Tag"}
                </span>
                {t.vehicleId && (
                  <span className="text-xs text-slate-500">Linked to vehicle</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasShipping(ship) && (
        <section className="mb-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <MapPin className="h-4 w-4 text-emerald-600" />
            Delivery address
          </h3>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
            {ship.fullName && (
              <p className="font-semibold text-slate-900 dark:text-slate-100">{ship.fullName}</p>
            )}
            {ship.phone && <p className="mt-1">Phone: {ship.phone}</p>}
            <p className="mt-1">{formatShippingAddr(ship, { detailsInParens: true })}</p>
          </div>
        </section>
      )}

      {String(order.paymentStatus || "").toLowerCase() === "paid" ? (
        <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-4 dark:border-slate-700">
          <InvoiceDownloadButton
            order={order}
            customer={customer}
            className="btn btn-outline btn-sm w-fit gap-1.5 rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
          />
        </div>
      ) : null}
    </div>
  );
}

const UserOrders = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-orders", page],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/order/my-orders?page=${page}&limit=10`);
      const body = res.data;
      if (Array.isArray(body)) {
        return { orders: body, total: body.length, page: 1 };
      }
      return body;
    },
    enabled: !!user,
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));
  const customer = {
    name: user?.name || user?.displayName,
    email: user?.email,
  };

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return <SmartLoader label="Loading your orders..." />;
  }

  if (isError) {
    return (
      <p className="py-16 text-center text-red-600 dark:text-red-400">
        Failed to load orders.
      </p>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-[40vh] px-6 py-16 text-center">
        <div className={`mx-auto max-w-xl p-10 ${cardSurface}`}>
          <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            No orders yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Your orders will appear here after checkout.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-10rem)] max-w-4xl px-4 py-8 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
          My orders
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {total} order{total !== 1 ? "s" : ""} — tap a card to view full details
        </p>
      </header>

      <div className="space-y-4">
        {orders.map((order) => {
          const open = expanded[order._id];
          const badge = paymentBadge(order);

          return (
            <article
              key={order._id}
              className={`${cardSurface} overflow-hidden transition-shadow hover:shadow-md`}
            >
              <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-900/60 sm:h-12 sm:w-12">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-bold tracking-tight text-emerald-700 dark:text-emerald-400 sm:text-xl">
                        {formatOrderNo(order.orderNo)}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDateShort(order.createdAt)}
                    </p>
                    {!open && (
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                        {orderSummaryLine(order)}
                      </p>
                    )}
                  </div>
                </div>

                <p className="shrink-0 whitespace-nowrap text-xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
                  {formatBdt(order.totalAmount)}
                </p>
              </div>

              <button
                type="button"
                aria-expanded={open}
                className="flex w-full items-center justify-center gap-2 border-t border-slate-100 bg-slate-50/60 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-emerald-50/80 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                onClick={() => toggleExpanded(order._id)}
              >
                {open ? (
                  <>
                    Hide order details
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    View order details
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>

              {open && (
                <OrderDetailsPanel order={order} customer={customer} />
              )}
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            type="button"
            className="btn btn-sm rounded-xl"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="self-center text-sm text-slate-600 dark:text-slate-400">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-sm rounded-xl"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
