import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Trash2,
  Search,
  SlidersHorizontal,
  Package,
  Sparkles,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import productFallback from "../../../assets/product/product01.png";

import useCart from "../../../hooks/useCart";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";
import { FEATURED_PRODUCT_ID } from "../../../config/featuredProduct";
import { API_BASE_URL } from "../../../config/api";
import useAuth from "../../../hooks/useAuth";

function normalizeProductList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  if (raw?.products && Array.isArray(raw.products)) return raw.products;
  return [];
}

const CATALOG_PAGE_SIZE = 4;

const ProductShowcase = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPrice, setFilterPrice] = useState("all");
  const [notification, setNotification] = useState(null);
  const [showAllCatalog, setShowAllCatalog] = useState(false);

  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const { cartItems, addToCart, removeFromCart } = useCart();

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

  const {
    data: spotlightProduct,
    isLoading: spotlightLoading,
  } = useQuery({
    queryKey: ["product", "hero-spotlight", FEATURED_PRODUCT_ID],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/products/${FEATURED_PRODUCT_ID}`);
      return res.data?.data ?? null;
    },
    retry: 1,
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

  /** Hero already shows spotlight — skip duplicate in the grid when loaded */
  const catalogProducts = useMemo(() => {
    if (!spotlightProduct) return filteredProducts;
    return filteredProducts.filter(
      (p) => String(p._id) !== FEATURED_PRODUCT_ID
    );
  }, [filteredProducts, spotlightProduct]);

  const visibleCatalogProducts = useMemo(() => {
    if (showAllCatalog) return catalogProducts;
    return catalogProducts.slice(0, CATALOG_PAGE_SIZE);
  }, [catalogProducts, showAllCatalog]);

  const hasMoreCatalog = catalogProducts.length > CATALOG_PAGE_SIZE;

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3200);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    showNotification("success", `${product.title} added to cart`);
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    showNotification("success", "Removed from cart");
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

      <header className="relative overflow-hidden border-b border-slate-200/80 bg-slate-900">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgb(59 130 246 / 0.35), transparent 45%), radial-gradient(circle at 80% 60%, rgb(245 158 11 / 0.25), transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-amber-200/90 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                {t("store.title")}
              </span>
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("store.featured")}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                {t("store.featuredSubtitle")}
              </p>
              <button
                type="button"
                onClick={() => navigate("/product")}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-100 backdrop-blur transition hover:bg-amber-500/25"
              >
                {t("store.fullDetails")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex w-full justify-center lg:justify-end">
              {spotlightLoading && (
                <div className="flex h-[min(340px,50vh)] w-full max-w-md flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-12 backdrop-blur-sm">
                  <Loader2 className="h-10 w-10 animate-spin text-amber-300/90" aria-hidden />
                  <span className="text-sm text-slate-400">Loading product…</span>
                </div>
              )}
              {!spotlightLoading && spotlightProduct && (
                <article className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-400/30 bg-white/10 shadow-2xl shadow-black/20 ring-1 ring-white/10 backdrop-blur-md">
                  <div className="relative aspect-4/3 bg-slate-800/40">
                    <img
                      src={spotlightProduct.image || productFallback}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-900 shadow-sm">
                      Spotlight
                    </span>
                  </div>
                  <div className="space-y-3 p-4 sm:p-5">
                    <h2 className="line-clamp-2 text-lg font-bold leading-snug text-white sm:text-xl">
                      {spotlightProduct.title}
                    </h2>
                    <p className="line-clamp-2 text-sm text-slate-300">
                      {spotlightProduct.description}
                    </p>
                    <p className="text-2xl font-bold tabular-nums text-amber-300">
                      ৳ {Number(spotlightProduct.price).toLocaleString()}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(spotlightProduct)}
                        className="btn flex-1 gap-2 rounded-xl border-0 bg-amber-500 text-sm font-semibold text-slate-900 hover:bg-amber-400"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {t("store.addToCart")}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/product")}
                        className="btn flex-1 rounded-xl border border-white/25 bg-transparent text-sm font-semibold text-white hover:bg-white/10"
                      >
                        {t("store.details")}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              )}
              {!spotlightLoading && !spotlightProduct && (
                <div className="flex min-h-[200px] w-full max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-10 text-center">
                  <Package className="mb-2 h-10 w-10 text-slate-500" />
                  <p className="text-sm text-slate-400">
                    Set <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">FEATURED_PRODUCT_ID</code> in
                    the database to show the product here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
          <section className="order-1 space-y-6 lg:col-span-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">
                  {isLoading ? "…" : catalogProducts.length}
                </span>{" "}
                {catalogProducts.length === 1 ? "product" : "products"}
                {searchTerm || filterPrice !== "all" ? " (filtered)" : ""}
                {spotlightProduct && (
                  <span className="ml-1 text-slate-400">(spotlight above)</span>
                )}
                {hasMoreCatalog && !showAllCatalog && (
                  <span className="ml-1 block text-slate-400 sm:inline">
                    — showing first {CATALOG_PAGE_SIZE}
                  </span>
                )}
              </p>
            </div>

            {isError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                Could not load the catalog. Ensure the API is running at{" "}
                <code className="rounded bg-white px-1">{API_BASE_URL}</code> (set{" "}
                <code className="rounded bg-white px-1">VITE_API_BASE_URL</code> in{" "}
                <code className="rounded bg-white px-1">client/.env</code>) and try again.
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  type="search"
                  className="input input-bordered w-full rounded-xl border-slate-300 bg-slate-50 pl-10 pr-4 text-sm shadow-sm focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/15"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowAllCatalog(false);
                  }}
                  autoComplete="off"
                />
              </div>
              <div className="relative sm:w-52">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:hidden" />
                <select
                  className="select select-bordered w-full rounded-xl border-slate-300 bg-slate-50 text-sm shadow-sm focus:border-amber-600 sm:pl-3"
                  value={filterPrice}
                  onChange={(e) => {
                    setFilterPrice(e.target.value);
                    setShowAllCatalog(false);
                  }}
                >
                  <option value="all">{t("store.allPrices")}</option>
                  <option value="under300">{t("store.under300")}</option>
                  <option value="300-500">{t("store.between300500")}</option>
                  <option value="above500">{t("store.above500")}</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-slate-200 bg-white/80 py-16">
                <SmartLoader label="Loading products..." />
              </div>
            ) : catalogProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center">
                <Package className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-3 font-medium text-slate-700">
                  {filteredProducts.length === 0 && products.length > 0
                    ? "No products match your filters"
                    : "No other products in the list"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {filteredProducts.length === 0 && products.length > 0
                    ? "Try another search or price filter."
                    : spotlightProduct
                      ? "The spotlight item is shown above."
                      : "Add products from the dashboard."}
                </p>
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-2">
                  {visibleCatalogProducts.map((product) => (
                    <li key={product._id}>
                      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-300/90 bg-slate-50 shadow-sm transition duration-200 hover:border-amber-300/70 hover:shadow-md">
                        <div className="relative aspect-4/3 overflow-hidden bg-slate-200">
                          <img
                            src={product.image || productFallback}
                            alt=""
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                          {product.type && (
                            <span className="absolute left-3 top-3 rounded-full bg-slate-900/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                              {product.type}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-4 sm:p-5">
                          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                            {product.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">
                            {product.description}
                          </p>
                          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
                            <div>
                              <p className="text-lg font-bold tabular-nums text-amber-700">
                                ৳ {Number(product.price).toLocaleString()}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-500">
                                Validity: {product.validityDays ?? 365} days / unit
                              </p>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                              {product.rating != null && (
                                <span className="tabular-nums">
                                  ★ {product.rating}
                                  {product.reviews != null && ` (${product.reviews})`}
                                </span>
                              )}
                            </div>
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
                {hasMoreCatalog && (
                  <div className="mt-8 flex flex-col items-center gap-2">
                    {!showAllCatalog ? (
                      <button
                        type="button"
                        onClick={() => setShowAllCatalog(true)}
                        className="btn gap-2 rounded-xl border-2 border-amber-600/40 bg-amber-100/60 px-8 text-base font-semibold text-amber-900 shadow-sm hover:bg-amber-100"
                      >
                        {t("store.more")}
                        <span className="text-sm font-normal opacity-80">
                          ({catalogProducts.length - CATALOG_PAGE_SIZE} more)
                        </span>
                        <ChevronDown className="h-5 w-5" aria-hidden />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAllCatalog(false)}
                        className="btn btn-ghost gap-2 rounded-xl text-slate-600 hover:bg-slate-100"
                      >
                        <ChevronUp className="h-4 w-4" aria-hidden />
                        {t("store.showLess")}
                      </button>
                    )}
                  </div>
                )}
              </>
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
                {cartItems.length === 0 ? (
                  <div className="py-10 text-center">
                    <ShoppingCart className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-2 text-sm font-medium text-slate-600">Cart is empty</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Add products from the list
                    </p>
                  </div>
                ) : (
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
                            {item.quantity > 1 && (
                              <span className="text-slate-400">
                                {" "}
                                × {item.quantity}
                              </span>
                            )}
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
                )}
              </div>

              {cartItems.length > 0 && (
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
                  <button
                    type="button"
                    onClick={() => navigate("/user/my-cart")}
                    className="btn btn-ghost btn-block btn-sm rounded-xl text-slate-600"
                  >
                    View full cart
                  </button>
                </div>
              )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;
