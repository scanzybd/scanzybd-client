import React, { useEffect, useState } from "react";
import ProductDetails from "./ProductDetails";
import useCart from "../../../hooks/useCart.jsx";
import { Link, useNavigate } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";
import { FEATURED_PRODUCT_ID } from "../../../config/featuredProduct";
import { useTranslation } from "react-i18next";

const ProductPage = () => {
  const { t } = useTranslation();
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
      message: `${product.title} ${t("store.addToCart").toLowerCase()}!`,
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-linear-to-b from-yellow-50/90 to-white px-4 py-16 text-center">
        <p className="text-lg font-semibold text-yellow-950">Spotlight product could not be loaded.</p>
        <p className="max-w-md text-sm text-yellow-900/60">
          Check that this id exists in the database, then try again.
        </p>
        <Link
          to="/Products"
          className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-yellow-950 shadow-sm transition hover:bg-yellow-600"
        >
          {t("store.title")}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-linear-to-b from-yellow-50/40 via-white to-amber-50/20">

      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm transition-opacity duration-300">
          <div className="rounded-xl border border-yellow-200 bg-yellow-500 px-5 py-3 font-medium text-yellow-950 shadow-lg shadow-yellow-900/10">
            {notification.message}
          </div>
        </div>
      )}

      <ProductDetails product={product} onAddToCart={handleAddToCart} />

      {/* Sticky cart strip */}
      <div className="border-t border-yellow-100 bg-white/80 px-4 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-yellow-100 bg-linear-to-r from-yellow-50 to-amber-50/80 p-6 shadow-sm sm:flex-row sm:p-8">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-yellow-800/80">
                {t("labels.checkout")}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-yellow-950">
                {cartItems.length}{" "}
                {cartItems.length === 1 ? "item" : "items"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleViewCart}
              className="w-full rounded-xl bg-yellow-500 px-8 py-3.5 font-semibold text-yellow-950 shadow-sm transition hover:bg-yellow-600 sm:w-auto"
            >
              {t("store.details")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;