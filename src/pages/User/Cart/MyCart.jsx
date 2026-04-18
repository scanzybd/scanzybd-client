import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../../../hooks/useCart";

const MyCart = () => {
  const {
    cartItems,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  // 💰 Total price (optimized)
  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  // 📦 Total items (quantity based)
  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
  }, [cartItems]);

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen flex flex-col">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">🛒 My Cart</h1>

      {/* Empty State */}
      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Your cart is empty</p>

          <button
            onClick={() => navigate("/shop")}
            className="mt-4 px-6 py-3 bg-yellow-400 rounded-lg font-semibold"
          >
            Go Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._id || item.id || item.productId}
                className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-white"
              >
                {/* Product Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.title || item.name}
                    className="w-16 h-16 object-cover rounded"
                  />

                  <div>
                    <h2 className="font-semibold">
                      {item.title || item.name}
                    </h2>
                    <p className="text-gray-500">৳ {item.price}</p>
                  </div>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      item.quantity > 1 && decreaseQty(item._id)
                    }
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQty(item._id)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="font-semibold">
                  ৳ {item.price * item.quantity}
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Bottom Summary */}
          <div className="mt-8 p-6 border rounded-lg bg-yellow-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-gray-600">
                Total Items: {totalItems}
              </p>

              <p className="text-2xl font-bold text-amber-600">
                Total: ৳ {totalPrice}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="px-5 py-2 bg-red-500 text-white rounded-lg"
              >
                Clear Cart
              </button>

              <button
                onClick={() => navigate("/user/checkout")}
                className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold"
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyCart;