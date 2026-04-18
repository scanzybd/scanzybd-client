import React, { useMemo, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useCart from "../../../hooks/useCart";

const Checkout = () => {
  const axiosSecure = useAxiosSecure();
  const { user: firebaseUser } = useAuth();

  const [loading, setLoading] = useState(false);

  // Load cart safely
  const cart = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  }, []);

  // Calculate total
  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + Number(item.price) * Number(item.quantity || 1),
      0
    );
  }, [cart]);

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (!firebaseUser?.email) {
        alert("Please login first");
        return;
      }

      const token = await firebaseUser.getIdToken();

      // STEP 1: CREATE ORDER
      const orderRes = await axiosSecure.post(
        "/api/order/create",
        {
          cartItems: cart,
          amount: total,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orderId = orderRes?.data?.orderId;

      if (!orderId) throw new Error("Order failed");

      // STEP 2: CREATE PAYMENT
      const paymentRes = await axiosSecure.post(
        "/api/payment/create",
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = paymentRes?.data?.bkashURL;

      if (!url) throw new Error("Payment failed");

      localStorage.setItem("pendingOrderId", orderId);

      window.location.href = url;

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      <div className="w-full max-w-3xl">

        {/* CART CARD */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold mb-5">Your Cart</h2>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              🛒 Your cart is empty
            </p>
          ) : (
            <div className="space-y-4">
              {cart.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-4">
                    {/* IMAGE */}
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      IMG
                    </div>

                    {/* INFO */}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      ৳ {item.price * item.quantity}
                    </p>
                    <p className="text-xs text-gray-400">
                      ৳ {item.price} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TOTAL */}
          <div className="mt-6 border-t pt-4 flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-xl font-bold text-pink-600">
              ৳ {total}
            </span>
          </div>
        </div>

        {/* PAYMENT BUTTON */}
        <button
          onClick={handlePayment}
          disabled={loading || cart.length === 0}
          className={`mt-6 w-full py-3 rounded-xl text-white font-semibold transition ${
            loading || cart.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-pink-600 hover:bg-pink-700"
          }`}
        >
          {loading ? "Processing..." : "Pay with bKash"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;