import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const Payment = () => {
  const axiosSecure = useAxiosSecure();

  // ✅ FETCH PAYMENT HISTORY (ONLY SUCCESS)
  const {
    data: payments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-payments"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/payment/my-payments");
      return res.data;
    },
  });

  // ⏳ Loading
  if (isLoading) {
    return (
      <p className="py-10 text-center text-slate-600 dark:text-slate-300">
        Loading payments...
      </p>
    );
  }

  // ❌ Error
  if (isError) {
    return (
      <p className="py-10 text-center text-red-600">
        Failed to load payments
      </p>
    );
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-8rem)] max-w-5xl bg-linear-to-b from-slate-100/80 to-white p-6 dark:from-slate-900 dark:to-slate-950">

      <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        My Payment History
      </h2>

      {/* EMPTY STATE */}
      {payments.length === 0 ? (
        <p className="text-center text-slate-600 dark:text-slate-400">
          No successful payments found
        </p>
      ) : (
        <div className="space-y-4">

          {payments.map((payment) => (
            <div
              key={payment._id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90"
            >

              {/* LEFT INFO */}
              <div className="space-y-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Order ID: {payment.orderId?._id}
                </p>

                <p className="text-slate-700 dark:text-slate-300">
                  Amount: ৳ {payment.amount}
                </p>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Method: {payment.paymentMethod}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-500">
                  TXN: {payment.paymentID}
                </p>
              </div>

              {/* STATUS */}
              <div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Success
                </span>
              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default Payment;