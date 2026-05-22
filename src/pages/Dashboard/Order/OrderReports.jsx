import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";

const OrderReports = () => {
  const axiosSecure = useAxiosSecure();
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["order-reports", userRole],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order");
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const stats = useMemo(() => {
    const pendingOrders = orders.filter((o) => o?.status === "pending").length;
    const returnedOrders = orders.filter((o) => o?.status === "returned").length;
    const cancelledOrders = orders.filter((o) => o?.status === "cancelled").length;
    const totalAmount = orders.reduce(
      (sum, order) => sum + Number(order?.totalAmount || 0),
      0
    );

    if (isAdmin) {
      const paidOrders = orders.filter((o) => o?.paymentStatus === "paid").length;
      const unpaidOrders = orders.filter((o) => o?.paymentStatus !== "paid").length;
      const completedOrders = orders.filter((o) =>
        ["confirmed", "paid"].includes(o?.status)
      ).length;
      const shippedOrders = orders.filter((o) => o?.status === "shipped").length;
      const deliveredOrders = orders.filter((o) => o?.status === "delivered").length;

      return [
        { label: "Total Orders", value: orders.length, valueClass: "text-slate-900 dark:text-slate-100" },
        {
          label: "Gross Revenue",
          value: `৳ ${totalAmount.toLocaleString()}`,
          valueClass: "text-slate-900 dark:text-slate-100",
        },
        { label: "Paid Orders", value: paidOrders, valueClass: "text-emerald-600 dark:text-emerald-400" },
        { label: "Unpaid Orders", value: unpaidOrders, valueClass: "text-rose-600 dark:text-rose-400" },
        { label: "Completed", value: completedOrders, valueClass: "text-emerald-600 dark:text-emerald-400" },
        { label: "Shipped", value: shippedOrders, valueClass: "text-sky-600 dark:text-sky-400" },
        { label: "Delivered", value: deliveredOrders, valueClass: "text-teal-600 dark:text-teal-400" },
        { label: "Returned", value: returnedOrders, valueClass: "text-orange-600 dark:text-orange-400" },
        { label: "Pending", value: pendingOrders, valueClass: "text-amber-600 dark:text-amber-400" },
        { label: "Cancelled", value: cancelledOrders, valueClass: "text-rose-600 dark:text-rose-400" },
      ];
    }

    const confirmedOrders = orders.filter((o) =>
      ["confirmed", "paid"].includes(o?.status)
    ).length;

    return [
      { label: "Your orders (your products)", value: orders.length, valueClass: "text-slate-900 dark:text-slate-100" },
      {
        label: "Amount (your products)",
        value: `৳ ${totalAmount.toLocaleString()}`,
        valueClass: "text-slate-900 dark:text-slate-100",
      },
      { label: "Confirmed", value: confirmedOrders, valueClass: "text-emerald-600 dark:text-emerald-400" },
      { label: "Pending", value: pendingOrders, valueClass: "text-amber-600 dark:text-amber-400" },
      { label: "Returned", value: returnedOrders, valueClass: "text-orange-600 dark:text-orange-400" },
      { label: "Cancelled", value: cancelledOrders, valueClass: "text-rose-600 dark:text-rose-400" },
    ];
  }, [orders, isAdmin]);

  if (isLoading) {
    return <SmartLoader label="Preparing order reports..." />;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Order Reports</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isAdmin
            ? "Live summary of order, payment, and delivery status."
            : "Summary for orders that include products you added."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
            <p className={`mt-2 text-2xl font-bold ${item.valueClass}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OrderReports;
