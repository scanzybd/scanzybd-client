import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";

const OrderReports = () => {
  const axiosSecure = useAxiosSecure();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["order-reports"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order");
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  if (isLoading) {
    return <SmartLoader label="Preparing order reports..." />;
  }

  const totalOrders = orders.length;
  const totalAmount = orders.reduce(
    (sum, order) => sum + Number(order?.totalAmount || 0),
    0
  );
  const paidOrders = orders.filter((o) => o?.paymentStatus === "paid").length;
  const unpaidOrders = orders.filter((o) => o?.paymentStatus !== "paid").length;
  const completedOrders = orders.filter((o) => o?.status === "completed").length;
  const cancelledOrders = orders.filter((o) => o?.status === "cancelled").length;
  const pendingOrders = orders.filter((o) => o?.status === "pending").length;

  const cards = [
    { label: "Total Orders", value: totalOrders, valueClass: "text-slate-900" },
    {
      label: "Gross Revenue",
      value: `৳ ${totalAmount.toLocaleString()}`,
      valueClass: "text-slate-900",
    },
    { label: "Paid Orders", value: paidOrders, valueClass: "text-emerald-600" },
    { label: "Unpaid Orders", value: unpaidOrders, valueClass: "text-rose-600" },
    { label: "Completed", value: completedOrders, valueClass: "text-emerald-600" },
    { label: "Pending", value: pendingOrders, valueClass: "text-amber-600" },
    { label: "Cancelled", value: cancelledOrders, valueClass: "text-rose-600" },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Order Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live summary of order, payment, and delivery status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {item.label}
            </p>
            <p className={`mt-2 text-2xl font-bold ${item.valueClass}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OrderReports;