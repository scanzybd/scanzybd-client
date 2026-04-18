import React, { useEffect, useState } from "react";
import ProductDetails from "./ProductDetails";
import useCart from "../../../hooks/useCart.jsx";
import { useNavigate, useParams } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ProductPage = () => {
  const { addToCart, cartItems } = useCart();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // 🔥 FETCH PRODUCT FROM DB
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosSecure.get(`/api/products/69e1ee0443c1fd1b6dd7a417`);

        setProduct(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ➕ ADD TO CART
  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product);

    setNotification({
      type: "success",
      message: `${product.title} added to cart!`,
    });

    setTimeout(() => setNotification(null), 2000);
  };

  const handleViewCart = () => {
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-10 text-center text-red-500">
        Product not found
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white">

      {/* 🔔 Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div className="px-6 py-3 rounded-lg shadow-lg text-white bg-emerald-500">
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
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-semibold rounded-lg hover:scale-105 transition"
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