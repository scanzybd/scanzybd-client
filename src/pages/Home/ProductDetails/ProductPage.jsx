import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  Trash2,
  Search,
  SlidersHorizontal,
  Package,
  ArrowRight,
} from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";
import useCart from "../../../hooks/useCart";
import productFallback from "../../../assets/product/product01.png";
import { API_BASE_URL } from "../../../config/api";

function normalizeProductList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  if (raw?.products && Array.isArray(raw.products)) return raw.products;
  return [];
}

const ProductPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addToCart, cartItems, removeFromCart } = useCart();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPrice, setFilterPrice] = useState("all");
  const [notification, setNotification] = useState(null);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/products");
      return normalizeProductList(res.data);
    },
    retry: 2,
    staleTime: 60_000,
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
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
  }, [products, searchTerm, filterPrice]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setNotification({
      type: "success",
      message: `${product.title} added to cart`,
    });
    setTimeout(() => setNotification(null), 3200);
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    setNotification({ type: "success", message: "Removed from cart" });
    setTimeout(() => setNotification(null), 2400);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/Products" } } });
    } else {
      navigate("/user/checkout");
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const discount = totalPrice > 0 ? Math.round(totalPrice * 0.1) : 0;
  const payable = totalPrice - discount;
  const cartCount = cartItems.reduce((n, i) => n + (i.quantity || 1), 0);

  if (isLoading) return <SmartLoader fullPage label="Loading products..." />;

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-slate-100 via-slate-50 to-slate-100">
      {notification && (
        <div className="fixed inset-x-0 top-0 z-100 flex justify-center px-3 pt-4 sm:left-auto sm:right-4 sm:top-4 sm:justify-end sm:px-0">
          <div
            role="status"
            className={`max-w-md rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg sm:max-w-sm ${
              notification.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
       
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
          <section className="order-1 space-y-6 lg:col-span-8">
            <div className="text-sm text-slate-600">
              
              {searchTerm || filterPrice !== "all" ? " (filtered)" : ""}
            </div>

            {isError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                Could not load the catalog. Ensure the API is running at{" "}
                <code className="rounded bg-white px-1">{API_BASE_URL}</code>.
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  className="input input-bordered w-full rounded-xl border-slate-300 bg-slate-50 pl-10 pr-4 text-sm shadow-sm focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/15"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="relative sm:w-52">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:hidden" />
                <select
                  className="select select-bordered w-full rounded-xl border-slate-300 bg-slate-50 text-sm shadow-sm focus:border-amber-600 sm:pl-3"
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                >
                  <option value="all">{t("store.allPrices")}</option>
                  <option value="under300">{t("store.under300")}</option>
                  <option value="300-500">{t("store.between300500")}</option>
                  <option value="above500">{t("store.above500")}</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center">
                <Package className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-3 font-medium text-slate-700">
                  {products.length ? "No products match your filters" : "No products yet"}
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-2">
                {filteredProducts.map((product) => (
                  <li key={product._id}>
                    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-300/90 bg-slate-50 shadow-sm transition duration-200 hover:border-amber-300/70 hover:shadow-md">
                      <div className="relative aspect-4/3 overflow-hidden bg-slate-200">
                        <img
                          src={product.image || productFallback}
                          alt=""
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                          {product.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">
                          {product.description}
                        </p>
                        <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                          <p className="text-lg font-bold tabular-nums text-amber-700">
                            ৳ {Number(product.price).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {product.validityDays ?? 365} days
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="btn mt-4 w-full gap-2 rounded-xl border-0 bg-amber-600 text-sm font-semibold text-white shadow-none hover:bg-amber-700"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {t("store.addToCart")}
                        </button>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {cartItems.length > 0 && (
            <aside className="order-2 lg:sticky lg:top-20 lg:col-span-4 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-slate-900">Your cart</h2>
                    <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-amber-500 px-2 text-sm font-bold text-slate-900">
                      {cartCount}
                    </span>
                  </div>
                </div>

                <div className="max-h-[min(420px,55vh)] overflow-y-auto px-4 py-3 sm:px-5">
                  <ul className="space-y-3">
                    {cartItems.map((item) => (
                      <li
                        key={item._id}
                        className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                          <img
                            src={item.image || productFallback}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium text-slate-900">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            ৳ {item.price}
                            {item.quantity > 1 && <span> × {item.quantity}</span>}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(item._id)}
                          className="btn btn-ghost btn-square btn-sm shrink-0 text-rose-600 hover:bg-rose-50"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-5">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium tabular-nums text-slate-900">
                      ৳ {totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-700">
                    <span>Est. discount (10%)</span>
                    <span className="tabular-nums">− ৳ {discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                    <span>Total</span>
                    <span className="tabular-nums text-amber-700">
                      ৳ {payable.toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="btn w-full gap-2 rounded-xl border-0 bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-700"
                  >
                    {t("labels.checkout")}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;