import React, { useState } from "react";
import ProductDetails from "./ProductDetails";
import product01 from "../../../assets/product/product01.png";
import useCart from "../../../hooks/useCart"; // ✅ FIXED
import { useNavigate } from "react-router-dom";

const ProductPage = () => {
  const { cartItems, addToCart } = useCart(); // ✅ MAIN FIX
  const navigate = useNavigate();

  const [notification, setNotification] = useState(null);

  const product = {
    id: 1,
    name: "QR Vehicle Tag Premium",
    price: 499,
    originalPrice: 699,
    image: product01,
    description:
      "This is a smart QR tag system for vehicle owners. Scan and connect instantly without sharing phone number.",
    features: [
      "NFC & QR enabled dual technology",
      "Weatherproof and durable design",
      "Real-time vehicle tracking",
      "Instant contact sharing",
      "Lifetime access to cloud storage",
      "24/7 customer support",
    ],
    specifications: {
      material: "Aircraft-grade aluminum",
      dimensions: "8.5cm x 5.4cm",
      weight: "15g",
      battery: "Passive (no battery needed)",
      waterproof: "IP67 rated",
    },
    rating: 4.8,
    reviews: 342,
    inStock: true,
  };

  // ➕ ADD TO CART (CLEAN)
  const handleAddToCart = () => {
    addToCart(product);

    setNotification({
      type: "success",
      message: `${product.name} added to cart!`,
    });

    setTimeout(() => setNotification(null), 2000);
  };

  // 🛒 CHECKOUT NAVIGATION
  const handleViewCart = () => {
    navigate("/cart");
  };

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white">

      {/* 🔔 Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
              notification.type === "success"
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS */}
      <ProductDetails product={product} onAddToCart={handleAddToCart} />

      {/* CART SUMMARY */}
      <div className="py-8 px-4 border-t bg-white">
        <div className="max-w-6xl mx-auto">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">

            <div>
              <p className="text-slate-600 font-medium">
                Shopping Cart Summary
              </p>

              <p className="text-2xl font-bold text-amber-600 mt-1">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </p>
            </div>

            <button
              onClick={handleViewCart}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-amber-600 transition transform hover:scale-105"
            >
              View Cart
            </button>

          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductPage;