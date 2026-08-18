import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  normalizeProductImages,
  productCoverImage,
  productCoverImageUrl,
  productImageUrl,
} from "../../../lib/productImages";
import SeoHead from "../../../components/SEO/SeoHead";
import { BRAND_FULL } from "../../../config/company";
import { absoluteUrl, buildCanonical } from "../../../config/seo";

function normalizeProductList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  if (raw?.products && Array.isArray(raw.products)) return raw.products;
  return [];
}

const HIDDEN_DETAIL_KEYS = new Set([
  "_id",
  "id",
  "image",
  "images",
  "isfeatured",
  "isactive",
  "instock",
  "originalprice",
  "createdby",
  "createdat",
  "updatedat",
  "__v",
  "v",
  "reviews",
  "displayorder",
]);

function toLabel(key) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);
}

/** Parse JSON object strings (e.g. specifications from API) without throwing. */
function tryParseJsonObjectString(str) {
  if (typeof str !== "string") return null;
  const s = str.trim();
  if (!s.startsWith("{") || !s.endsWith("}")) return null;
  try {
    const parsed = JSON.parse(s);
    return isPlainObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Render spec-style objects as "Label: value" lines (used for specifications, etc.). */
function formatSpecObject(obj) {
  const lines = Object.entries(obj)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => {
      const label = toLabel(k);
      let display;
      if (isPlainObject(v)) {
        const nested = formatSpecObject(v);
        display = nested ?? JSON.stringify(v);
      } else if (typeof v === "string") {
        const parsed = tryParseJsonObjectString(v);
        display = parsed ? formatSpecObject(parsed) ?? String(v) : formatDetailValue(k, v);
      } else {
        display = formatDetailValue(k, v);
      }
      if (display === null || display === "") return null;
      return `${label}: ${display}`;
    })
    .filter(Boolean);
  return lines.length ? lines.join("\n") : null;
}

function isFeaturesKey(key) {
  return String(key).toLowerCase() === "features";
}

function formatDetailValue(key, value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const items = value
      .map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item)))
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length === 0) return null;
    const sep = isFeaturesKey(key) ? "\n" : ", ";
    return items.join(sep);
  }
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isNaN(t) ? null : value.toLocaleString();
  }
  if (isPlainObject(value)) {
    return formatSpecObject(value) ?? JSON.stringify(value);
  }
  if (typeof value === "number" && key.toLowerCase().includes("price")) {
    return `৳ ${value.toLocaleString()}`;
  }
  if (typeof value === "string") {
    if (isFeaturesKey(key)) {
      const t = value.trim();
      if (t.startsWith("[") && t.endsWith("]")) {
        try {
          const arr = JSON.parse(t);
          if (Array.isArray(arr)) return formatDetailValue(key, arr);
        } catch {
          /* fall through */
        }
      }
    }
    const parsedObj = tryParseJsonObjectString(value);
    if (parsedObj) {
      return formatSpecObject(parsedObj) ?? value;
    }
    if (key.endsWith("At")) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return date.toLocaleString();
    }
  }
  if (key.endsWith("At") && typeof value !== "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString();
  }
  return String(value);
}

const ProductPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addToCart, cartItems, removeFromCart } = useCart();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { id } = useParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPrice, setFilterPrice] = useState("all");
  const [notification, setNotification] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

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
    data: selectedProduct,
    isLoading: selectedLoading,
  } = useQuery({
    queryKey: ["product-details", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/products/${id}`);
      return res.data?.data ?? null;
    },
    enabled: Boolean(id),
    retry: 1,
  });

  const galleryImages = useMemo(() => {
    const imgs = normalizeProductImages(selectedProduct);
    return imgs.length > 0 ? imgs : [productFallback];
  }, [selectedProduct]);

  useEffect(() => {
    setGalleryIndex(0);
  }, [selectedProduct?._id]);

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
    if (product?.isActive === false || product?.inStock === false) {
      setNotification({
        type: "error",
        message: "This product is not available.",
      });
      setTimeout(() => setNotification(null), 2400);
      return;
    }
    if (!user) {
      navigate("/login", {
        state: { from: { pathname: id ? `/Products/${id}` : "/Products" } },
      });
      return;
    }
    if (!addToCart(product)) {
      setNotification({
        type: "error",
        message: "Please sign in to add items to your cart.",
      });
      setTimeout(() => setNotification(null), 2400);
      return;
    }
    setNotification({
      type: "success",
      message: `${product.title} added to cart`,
    });
    setTimeout(() => setNotification(null), 1200);
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
  const productDetails = useMemo(() => {
    if (!selectedProduct) return [];

    return Object.entries(selectedProduct)
      .filter(([key]) => {
        if (["title", "description", "image", "price", "validityDays"].includes(key)) return false;
        return !HIDDEN_DETAIL_KEYS.has(String(key).toLowerCase());
      })
      .map(([key, value]) => ({
        key,
        label: toLabel(key),
        value: formatDetailValue(key, value),
      }))
      .filter((item) => item.value !== null);
  }, [selectedProduct]);

  if (isLoading || selectedLoading) return <SmartLoader fullPage label="Loading products..." />;

  if (id && !selectedProduct && !selectedLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">Product not found</p>
        <p className="mt-2 text-sm text-slate-500">This item may be unavailable or has been removed.</p>
        <button
          type="button"
          onClick={() => navigate("/Products")}
          className="btn mt-6 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        >
          Back to products
        </button>
      </div>
    );
  }

  if (id && selectedProduct) {
    const productPath = `/Products/${id}`;
    const cover = productCoverImage(selectedProduct);
    const productImage = cover && /^https?:\/\//i.test(cover)
      ? productImageUrl(cover, "detail")
      : absoluteUrl("/preview.png");
    const productDescription =
      selectedProduct.description ||
      `Buy ${selectedProduct.title} from ${BRAND_FULL}. Smart QR vehicle tags for safety in Bangladesh.`;
    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: selectedProduct.title,
      description: productDescription,
      image: productImage,
      url: buildCanonical(productPath),
      brand: {
        "@type": "Brand",
        name: BRAND_FULL,
      },
      offers: {
        "@type": "Offer",
        url: buildCanonical(productPath),
        priceCurrency: "BDT",
        price: Number(selectedProduct.price) || 0,
        availability:
          selectedProduct.inStock === false || selectedProduct.isActive === false
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
      },
    };

    return (
<div className="min-h-screen w-full bg-linear-to-b from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <SeoHead
          title={`${selectedProduct.title} | ${BRAND_FULL}`}
          description={productDescription}
          pathname={productPath}
          image={productImage}
          imageAlt={selectedProduct.title}
          type="product"
          jsonLd={productJsonLd}
        />
        {notification && (
          <div className="fixed inset-x-0 top-0 z-100 flex justify-center px-3 pt-4 sm:left-auto sm:right-4 sm:top-4 sm:justify-end sm:px-0">
            <div
              role="status"
              className="max-w-md rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg sm:max-w-sm"
            >
              {notification.message}
            </div>
          </div>
        )}
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/Products")}
            className="btn mb-5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Back to products
          </button>
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">            <div className="grid gap-0 md:grid-cols-2">
              {/* Main Info & Image gallery */}
              <div className="bg-slate-100 p-3 dark:bg-slate-800 sm:p-4">
                <div className="aspect-4/3 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-900">
                  <img
                    src={productImageUrl(galleryImages[galleryIndex] || productFallback, "detail", productFallback)}
                    alt={selectedProduct.title || "Product"}
                    className="h-full w-full object-cover"
                    decoding="async"
                  />
                </div>
                {galleryImages.length > 1 ? (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {galleryImages.map((url, index) => (
                      <button
                        key={`${url}-${index}`}
                        type="button"
                        onClick={() => setGalleryIndex(index)}
                        className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
                          galleryIndex === index
                            ? "border-amber-400 ring-2 ring-amber-400/40"
                            : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={productImageUrl(url, "thumb", productFallback)}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">{selectedProduct.title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:mt-3">
                  {selectedProduct.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
                  <p className="rounded-full bg-amber-50 px-3 py-1 text-2xl font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 sm:text-3xl">
                    ৳ {Number(selectedProduct.price).toLocaleString()}
                  </p>
                 
                  {selectedProduct.originalPrice && (
                    <span className="ml-2 line-through text-base text-slate-500 dark:text-slate-400">
                      ৳ {Number(selectedProduct.originalPrice).toLocaleString()}
                    </span>
                  )}
                   <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:text-sm">
                    Validity: {selectedProduct.validityDays ?? 365} days
                  </p>
                  {selectedProduct.type && (
                    <span className="ml-2 rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {selectedProduct.type}
                    </span>
                  )}
                  {selectedProduct.inStock === false && (
                    <span className="ml-2 rounded bg-rose-200 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                      Out of Stock
                    </span>
                  )}
                  {selectedProduct.rating && (
                    <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/50 dark:text-green-300">
                      ★ {selectedProduct.rating}
                      {selectedProduct.reviews ? ` (${selectedProduct.reviews} reviews)` : ""}
                    </span>
                  )}
                </div>

             

              
                {/* Show all other details (not hidden, as per logic in productDetails) */}
                {productDetails.length > 0 && (
                  <div className="mt-5 rounded-xl border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-800 sm:p-4">
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Details</h2>
                   
                    {/* Features List */}
                    <dl className="space-y-0">
                      {productDetails.map((item) => (
                        <div
                          key={item.key}
                          className="flex flex-row items-baseline border-b border-slate-200 px-1 py-2 dark:border-slate-700 last:border-b-0"
                        >
                          <dt className="w-36 flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {item.label}
                          </dt>
                          <dd className="ml-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{item.value}</dd>
                        </div>
                      
                      ))}
                    </dl>
                    
                  </div>
                  
                )}
           
           


                 
                
                <button
                  type="button"
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="btn mt-6 w-full gap-2 rounded-xl border-0 bg-yellow-500 text-sm font-semibold text-slate-900 hover:bg-yellow-600"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {t("store.addToCart")}
                </button>
              </div>
            </div>
          </article>
    
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
            <div className="text-sm text-slate-600 dark:text-slate-400">
              
              {searchTerm || filterPrice !== "all" ? " (filtered)" : ""}
            </div>

            {isError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                Could not load the catalog. Ensure the API is running at{" "}
                <code className="rounded bg-white px-1 dark:bg-slate-800 dark:text-slate-200">{API_BASE_URL}</code>.
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  className="input input-bordered w-full rounded-xl border-slate-300 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="relative sm:w-52">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:hidden" />
                <select
                  className="select select-bordered w-full rounded-xl border-slate-300 bg-slate-50 text-sm text-slate-900 shadow-sm focus:border-amber-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:pl-3"
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
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center dark:border-slate-700 dark:bg-slate-900/50">
                <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">
                  {products.length ? "No products match your filters" : "No products yet"}
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <li key={product._id}>
                    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-300/90 bg-white shadow-sm transition duration-200 hover:border-amber-300/70 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-amber-500/40">
                      <div className="relative aspect-4/3 overflow-hidden bg-slate-200 dark:bg-slate-800">
                        <img
                          src={productCoverImageUrl(product, "card", productFallback)}
                          alt=""
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 dark:text-slate-100 sm:text-lg">
                          {product.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                          {product.description}
                        </p>
                        <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
                          <p className="text-lg font-bold tabular-nums text-amber-700 dark:text-amber-400">
                            ৳ {Number(product.price).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {product.validityDays ?? 365} days
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="btn mt-4 w-full gap-2 rounded-xl border-0 bg-yellow-500 text-sm font-semibold text-slate-900 shadow-none hover:bg-yellow-600"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {t("store.addToCart")}
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/Products/${product._id}`)}
                          className="btn mt-2 w-full rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          {t("store.details")}
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
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4 dark:border-slate-700 dark:bg-slate-800 sm:px-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your cart</h2>
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
                        className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 dark:bg-slate-700 dark:ring-slate-600">
                          <img
                            src={productCoverImageUrl(item, "cart", productFallback)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            ৳ {item.price}
                            {item.quantity > 1 && <span> × {item.quantity}</span>}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(item._id)}
                          className="btn btn-ghost btn-square btn-sm shrink-0 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 border-t border-slate-100 bg-slate-50/50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800 sm:px-5">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>Subtotal</span>
                    <span className="font-medium tabular-nums text-slate-900 dark:text-white">
                      ৳ {totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-700 dark:text-emerald-400">
                    <span>Est. discount (10%)</span>
                    <span className="tabular-nums">− ৳ {discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900 dark:border-slate-600 dark:text-white">
                    <span>Total</span>
                    <span className="tabular-nums text-amber-700 dark:text-amber-400">
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