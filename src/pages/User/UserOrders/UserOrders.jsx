import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import React from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

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
        window.location.href = res.data.bkashURL;
      }
    } catch (error) {
      Swal.fire("Error", "Payment failed", "error");
    }
  };

  // 🔥 LOADING STATE
  if (isLoading) {
    return <p className="text-center">Loading...</p>;
  }

  // ❌ ERROR STATE
  if (isError) {
    return (
      <p className="text-center text-red-500">
        Failed to load orders ❌
      </p>
    );
  }

  // 📭 EMPTY STATE
  if (!orders.length) {
    return (
      <p className="text-center text-gray-500">
        No orders found 🛒
      </p>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">My Orders</h2>

      <div className="space-y-4">
        {orders.map((order) => {
          const isPaid = order.paymentStatus === "paid";

          return (
            <div
              key={order._id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <p>Order ID: {order._id}</p>
                <p>Total: ৳{order.totalAmount}</p>

                <p>
                  Status:{" "}
                  <span
                    className={isPaid ? "text-green-600" : "text-red-500"}
                  >
                    {isPaid ? "Paid" : "Unpaid"}
                  </span>
                </p>

                {isPaid && order.payment?.transactionId && (
                  <p className="text-sm text-gray-500">
                    TXN: {order.payment.transactionId}
                  </p>
                )}
              </div>

              <div>
                {!isPaid ? (
                  <button
                    onClick={() => handleCheckout(order._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Checkout
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-green-600 text-white px-4 py-2 rounded opacity-70"
                  >
                    Paid
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserOrders;