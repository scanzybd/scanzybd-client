import React from "react";

const OrderTable = ({ title, orders = [] }) => {
  const statusStyle = {
    pending: "text-yellow-500",
    paid: "text-green-600",
    cancelled: "text-red-500",
  };

  const paymentStyle = {
    paid: "text-green-600",
    unpaid: "text-red-500",
    pending: "text-yellow-500",
  };

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-5">{title}</h2>
        <p className="text-gray-500">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-5">{title}</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border p-4 rounded flex justify-between bg-white shadow-sm"
          >
            {/* LEFT SIDE */}
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Order ID:</span>{" "}
                {order._id}
              </p>

              <p>
                <span className="font-semibold">Total:</span> ৳
                {order.totalAmount}
              </p>

              <p>
                <span className="font-semibold">Payment:</span>{" "}
                <span className={paymentStyle[order.paymentStatus] || "text-gray-500"}>
                  {order.paymentStatus}
                </span>
              </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center">
              <span
                className={`font-semibold ${
                  statusStyle[order.status] || "text-gray-500"
                }`}
              >
                {order.status?.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTable;