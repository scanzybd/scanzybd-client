import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import React from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";

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

const statusBadgeClass = (isPaid) =>
  isPaid
    ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
    : "inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";

const UserOrders = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const {
  data: orders = [],
  isLoading,
  isError,
} = useQuery({
  queryKey: ["my-orders"],
  queryFn: async () => {
    const res = await axiosSecure.get("/api/order/my-orders");
    return res.data;
  },
  enabled: !!user,
});

  const handleCheckout = async (orderId) => {
    try {
      const res = await axiosSecure.post("/api/payment/create", {
        orderId,
      });

      if (res.data?.bkashURL) {
        window.location.assign(res.data.bkashURL);
      }
    } catch {
      Swal.fire("Error", "Payment failed", "error");
    }
  };

  // 🔥 LOADING STATE
  if (isLoading) {
    return <SmartLoader label="Loading your orders..." />;
  }

  // ❌ ERROR STATE
  if (isError) {
    return (
      <p className="text-center text-red-600">
        Failed to load orders ❌
      </p>
    );
  }

  const paidCount = orders.filter((order) => order.paymentStatus === "paid").length;
  const unpaidCount = orders.length - paidCount;

  if (!orders.length) {
    return (
      <div className="min-h-[40vh] bg-linear-to-b from-slate-100/80 to-white px-6 py-16 text-center dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white/90 p-10 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">No orders found</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Orders you place will appear here with payment status and details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-linear-to-b from-slate-100/80 to-white p-6 dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              My Orders
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Track payment status and complete unpaid orders.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:w-[360px]">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Total</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{orders.length}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/20">
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">Paid</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{paidCount}</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-center shadow-sm dark:border-rose-900/50 dark:bg-rose-900/20">
              <p className="text-[11px] text-rose-700 dark:text-rose-300">Unpaid</p>
              <p className="text-lg font-bold text-rose-700 dark:text-rose-300">{unpaidCount}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
        {orders.map((order) => {
          const isPaid = order.paymentStatus === "paid";

          return (
            <div
              key={order._id}
              className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900/90"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-4 sm:gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Order ID
                    </p>
                    <p className="mt-0.5 break-all font-mono text-xs text-slate-800 dark:text-slate-200">
                      {order._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Date
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Total
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      ৳{order.totalAmount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Status
                    </p>
                    <div className="mt-1">
                      <span className={statusBadgeClass(isPaid)}>{isPaid ? "Paid" : "Unpaid"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-[130px] flex-col items-stretch gap-2 sm:items-end">
                  {!isPaid ? (
                    <button
                      onClick={() => handleCheckout(order._id)}
                      className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-amber-600 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-600"
                    >
                      Pay Now
                    </button>
                  ) : (
                    <button
                      disabled
                      className="cursor-not-allowed rounded-lg bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 opacity-90 dark:bg-emerald-900/40 dark:text-emerald-300"
                    >
                      Paid
                    </button>
                  )}

                  {isPaid && order.payment?.transactionId && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      TXN: <span className="font-mono">{order.payment.transactionId}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default UserOrders;