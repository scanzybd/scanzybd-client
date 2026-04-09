import React, { useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const Checkout = () => {
    const axiosSecure = useAxiosSecure();
    const { user: firebaseUser } = useAuth();

    const [cart] = useState(() => {
        return JSON.parse(localStorage.getItem("cart")) || [];
    });

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const handlePayment = async () => {
        try {
            // ✅ 1. same pattern like AddVehiclePage
            if (!firebaseUser?.email) {
                alert("Please login first");
                return;
            }

            // optional: backend user check (same as mongoUser system)
            const token = await firebaseUser.getIdToken();

            // ✅ 2. request
            const res = await axiosSecure.post(
                "/api/payment/create",
                {
                    amount: total,
                    cartItems: cart,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = res.data;
            console.log("PAYMENT RESPONSE:", data);

            // ✅ 3. redirect
            if (data?.success && data?.bkashURL) {
                window.location.href = data.bkashURL;
            } else {
                alert(data?.message || "Payment init failed");
            }

        } catch (error) {
            console.error("Payment Error:", error);
            alert("Server error");
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>

            {cart.map((item, index) => (
                <div key={index} className="flex justify-between mb-2">
                    <span>{item.name}</span>
                    <span>৳ {item.price} x {item.quantity}</span>
                </div>
            ))}

            <h2 className="text-xl font-bold mt-4">
                Total: ৳ {total}
            </h2>

            <button
                onClick={handlePayment}
                className="mt-6 px-6 py-3 bg-pink-600 text-white rounded"
            >
                Pay with bKash
            </button>
        </div>
    );
};

export default Checkout;