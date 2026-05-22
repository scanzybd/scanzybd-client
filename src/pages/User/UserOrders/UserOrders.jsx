import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ChevronDown, ChevronUp } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";
import { cardSurface } from "../../../lib/uiClasses";

const formatDate = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  const map = {
    pending: "bg-amber-100 text-amber-800",
    processing: "bg-sky-100 text-sky-800",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-rose-100 text-rose-800",
    confirmed: "bg-emerald-100 text-emerald-800",
  };
  return map[s] || "bg-slate-100 text-slate-700";
};

const payBadge = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return "bg-emerald-100 text-emerald-800";
  if (s === "failed") return "bg-rose-100 text-rose-800";
  return "bg-rose-100 text-rose-800";
};

const methodLabel = (m) => {
  const map = {
    cash: "Cash",
    bkash_manual: "Manual bKash",
    bkash_online: "bKash Online",
    bkash: "bKash",
  };
  return map[String(m || "").toLowerCase()] || "bKash";
};

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

  const handleCheckout = async (orderId) => {
    try {
      const res = await axiosSecure.post("/api/payment/create", { orderId });
      if (res.data?.bkashURL) {
        window.location.assign(res.data.bkashURL);
      }
    } catch {
      Swal.fire("Error", "Payment failed", "error");
    }
  };

  if (isLoading) {
    return <SmartLoader label="Loading your orders..." />;
  }

  if (isError) {
    return (
      <p className="text-center text-red-600">Failed to load orders.</p>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-[40vh] px-6 py-16 text-center">
        <div className={`mx-auto max-w-xl p-10 ${cardSurface}`}>
          <p className="text-lg font-semibold">No orders yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Orders you place will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">My orders</h1>

      {orders.map((order) => {
        const open = expanded[order._id];
        return (
          <article key={order._id} className={`${cardSurface} overflow-hidden`}>
            <div className="flex flex-wrap items-start justify-between gap-3 p-5">
              <div>
                <p className="font-mono text-lg font-bold text-emerald-700">
                  #{order.orderNo}
                </p>
                <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadge(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${payBadge(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {methodLabel(order.paymentMethod)}
                </span>
              </div>
              <p className="w-full text-right text-lg font-bold sm:w-auto">
                ৳ {Number(order.totalAmount || 0).toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-1 border-t border-slate-100 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [order._id]: !open }))
              }
            >
              {open ? (
                <>
                  Hide details <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show details <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>

            {open && (
              <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4 text-sm">
                <p className="mb-2 font-semibold text-slate-700">Items</p>
                <ul className="space-y-1">
                  {(order.items || []).map((item, i) => (
                    <li key={i}>
                      {item.title} × {item.quantity} — ৳{" "}
                      {(
                        Number(item.price) * Number(item.quantity)
                      ).toLocaleString()}
                    </li>
                  ))}
                </ul>
                {(order.tagAssignments?.length ?? 0) > 0 && (
                  <>
                    <p className="mb-2 mt-4 font-semibold text-slate-700">Tags</p>
                    <ul className="space-y-1">
                      {order.tagAssignments.map((t, i) => (
                        <li key={i}>{t.productTitle || t.productId}</li>
                      ))}
                    </ul>
                  </>
                )}
                {order.paymentStatus === "unpaid" && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm mt-4 rounded-xl"
                    onClick={() => handleCheckout(order._id)}
                  >
                    Pay with bKash
                  </button>
                )}
              </div>
            )}
          </article>
        );
      })}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            type="button"
            className="btn btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="self-center text-sm">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-sm"
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
