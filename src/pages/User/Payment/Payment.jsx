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
    return <p className="text-center py-10">Loading payments...</p>;
  }

  // ❌ Error
  if (isError) {
    return (
      <p className="text-center text-red-500 py-10">
        Failed to load payments
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">

      <h2 className="text-2xl font-bold mb-6">
        My Payment History
      </h2>

      {/* EMPTY STATE */}
      {payments.length === 0 ? (
        <p className="text-gray-500 text-center">
          No successful payments found
        </p>
      ) : (
        <div className="space-y-4">

          {payments.map((payment) => (
            <div
              key={payment._id}
              className="border p-4 rounded-lg shadow-sm flex justify-between items-center bg-white"
            >

              {/* LEFT INFO */}
              <div className="space-y-1">
                <p className="font-semibold">
                  Order ID: {payment.orderId?._id}
                </p>

                <p className="text-gray-600">
                  Amount: ৳ {payment.amount}
                </p>

                <p className="text-sm text-gray-500">
                  Method: {payment.paymentMethod}
                </p>

                <p className="text-xs text-gray-400">
                  TXN: {payment.paymentID}
                </p>
              </div>

              {/* STATUS */}
              <div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
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