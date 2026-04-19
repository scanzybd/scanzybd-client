import React, { useState } from "react";
import { ShoppingCart, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import productFallback from "../../../assets/product/product01.png";

import useCart from "../../../hooks/useCart";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";

const ProductShowcase = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPrice, setFilterPrice] = useState("all");
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { cartItems, addToCart, removeFromCart } = useCart();

  // ✅ FETCH PRODUCTS FROM DB
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/products");
      return res.data;
    },
  });

  // 🔎 FILTER
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesPrice =
      filterPrice === "all" ||
      (filterPrice === "under300" && product.price < 300) ||
      (filterPrice === "300-500" &&
        product.price >= 300 &&
        product.price <= 500) ||
      (filterPrice === "above500" && product.price > 500);

    return matchesSearch && matchesPrice;
  });

  // 🔔 NOTIFICATION
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // ➕ ADD TO CART
  const handleAddToCart = (product) => {
    addToCart(product);
    showNotification("success", `${product.title} added to cart!`);
  };

  // ❌ REMOVE FROM CART
  const handleRemove = (id) => {
    removeFromCart(id);
    showNotification("success", "Item removed!");
  };

  // 💳 CHECKOUT
  const handleCheckout = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      navigate("/user/checkout");
    }
  };

  // 💰 TOTAL PRICE
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discount = totalPrice > 0 ? Math.round(totalPrice * 0.1) : 0;

  // ⏳ LOADING
  if (isLoading) {
    return <SmartLoader fullPage label="Loading products..." />;
  }

  // ❌ ERROR
  if (isError) {
    return (
      <p className="text-center text-red-500 py-10">
        Failed to load products
      </p>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 via-white to-slate-50">

      {/* 🔔 Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg text-white ${
              notification.type === "success"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 py-12 text-center">
        <h1 className="text-4xl font-bold text-white">
          Featured Products
        </h1>
        <p className="text-gray-800 mt-2">
          Explore smart QR solutions
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-8">

        {/* PRODUCTS */}
        <div className="lg:col-span-2 space-y-6">

          {/* SEARCH + FILTER */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                className="w-full pl-10 py-2 border rounded"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="border px-3 py-2 rounded"
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
            >
              <option value="all">All</option>
              <option value="under300">Under 300</option>
              <option value="300-500">300-500</option>
              <option value="above500">Above 500</option>
            </select>
          </div>

          {/* PRODUCT GRID */}
          <div className="grid sm:grid-cols-2 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white p-4 rounded-xl shadow"
              >
                <img
                  src={product.image || productFallback}
                  alt={product.title}
                  className="h-40 w-full object-cover"
                />

                <h3 className="font-bold mt-2">{product.title}</h3>

                <p className="text-sm text-gray-500 line-clamp-2">
                  {product.description}
                </p>

                <p className="text-yellow-600 font-bold mt-1">
                  ৳ {product.price}
                </p>

                <p className="text-xs text-indigo-600 mt-0.5">
                  Validity: {product.validityDays ?? 365} days / unit after payment
                </p>

                <p className="text-sm text-gray-600">
                  ⭐ {product.rating} ({product.reviews})
                </p>

                <p className="text-xs text-gray-400">
                  {product.type}
                </p>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full mt-3 bg-yellow-500 py-2 rounded text-black font-semibold"
                >
                  <ShoppingCart className="inline w-4 h-4 mr-1" />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CART */}
        <div className="bg-white p-5 rounded-xl shadow h-fit sticky top-20">

          <div className="flex justify-between mb-4">
            <h2 className="font-bold text-xl">Cart</h2>
            <span className="bg-yellow-400 px-3 py-1 rounded-full">
              {cartItems.length}
            </span>
          </div>

          {cartItems.length === 0 ? (
            <p className="text-gray-500">Cart empty</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between mb-2"
                >
                  <div>
                    <p>{item.title}</p>
                    <p className="text-yellow-600">৳ {item.price}</p>
                  </div>

                  <button onClick={() => handleRemove(item._id)}>
                    <Trash2 className="text-red-500 w-4 h-4" />
                  </button>
                </div>
              ))}

              <hr className="my-3" />

              <p>Total: ৳ {totalPrice - discount}</p>

              <button
                onClick={handleCheckout}
                className="w-full mt-4 bg-green-600 text-white py-2 rounded"
              >
                Checkout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;