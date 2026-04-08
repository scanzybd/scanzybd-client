import React, {  useState } from "react";

const Checkout = () => {
const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem("cart")) || [];
});
 
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handlePayment = async () => {
        const res = await fetch("http://localhost:5000/api/payment/create");
        const data = await res.json();

        window.location.href = data.bkashURL;
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>

            {cart.map(item => (
                <div key={item.id} className="flex justify-between mb-2">
                    <span>{item.name}</span>
                    <span>৳ {item.price} x {item.quantity}</span>
                </div>
            ))}

            <h2 className="text-xl font-bold mt-4">Total: ৳ {total}</h2>

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