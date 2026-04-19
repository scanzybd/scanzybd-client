import React, { useEffect, useState } from "react";
import ProductDetails from "./ProductDetails";
import useCart from "../../../hooks/useCart.jsx";
import { Link, useNavigate } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";
import { FEATURED_PRODUCT_ID } from "../../../config/featuredProduct";

const ProductPage = () => {
  const { addToCart, cartItems } = useCart();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axiosSecure.get(`/api/products/${FEATURED_PRODUCT_ID}`);
        if (!cancelled) setProduct(res.data.data ?? null);
      } catch (error) {
        console.log(error);
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [axiosSecure]);

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
    navigate("/user/my-cart");
  };

  if (loading) {
    return <SmartLoader fullPage label="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-medium text-slate-800">Spotlight product could not be loaded.</p>
        <p className="max-w-md text-sm text-slate-600">
          Check that this id exists in the database, then try again.
        </p>
        <Link to="/Products" className="btn btn-primary rounded-xl">
          Back to store
        </Link>
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