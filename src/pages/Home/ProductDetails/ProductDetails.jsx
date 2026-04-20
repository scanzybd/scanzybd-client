import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    ShoppingCart,
    Star,
    Check,
    Truck,
    Shield,
    RotateCcw,
    Heart,
    Sparkles,
} from "lucide-react";

const ProductDetails = ({ product, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);

    const displayName = product.title || product.name || "Product";
    const features = Array.isArray(product.features) ? product.features : [];
    const specifications =
        product.specifications && typeof product.specifications === "object"
            ? product.specifications
            : {};
    const specEntries = Object.entries(specifications).filter(
        ([, value]) => value != null && String(value).trim() !== ""
    );

    const originalPrice = Number(product.originalPrice) || 0;
    const price = Number(product.price) || 0;
    const discountPct =
        originalPrice > 0 && originalPrice > price
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : 0;
    const saveAmount = Math.max(0, originalPrice - price);

    const rating = Number(product.rating) || 0;
    const reviewCount = product.reviews ?? 0;

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            onAddToCart(product);
        }
        setQuantity(1);
    };

    return (
        <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto max-w-6xl">
                {/* Top accent bar */}
                <div className="mb-8 overflow-hidden rounded-2xl border border-yellow-100 bg-gradient-to-r from-yellow-400/15 via-amber-50/50 to-yellow-100/30 px-4 py-3 sm:px-6">
                    <div className="flex flex-wrap items-center justify-center gap-2 text-center sm:justify-between">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-yellow-900">
                            <Sparkles className="h-4 w-4 text-yellow-600" />
                            Featured product — scan-ready QR solutions
                        </span>
                    </div>
                </div>

                {/* Breadcrumb */}
                <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-yellow-900/60">
                    <Link to="/" className="transition hover:text-yellow-700">
                        Home
                    </Link>
                    <span className="text-yellow-400">/</span>
                    <Link to="/Products" className="transition hover:text-yellow-700">
                        Products
                    </Link>
                    <span className="text-yellow-400">/</span>
                    <span className="line-clamp-1 font-medium text-yellow-950">
                        {displayName}
                    </span>
                </nav>

                <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
                    {/* Gallery */}
                    <div className="flex flex-col gap-4">
                        <div className="relative overflow-hidden rounded-3xl border border-yellow-100 bg-white shadow-xl shadow-yellow-900/5 ring-1 ring-yellow-100/80">
                            <img
                                src={product.image}
                                alt={displayName}
                                className="h-80 w-full object-cover sm:h-[22rem] lg:h-[26rem]"
                            />
                            {discountPct > 0 && (
                                <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                                    −{discountPct}%
                                </div>
                            )}
                            {product.inStock && (
                                <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-yellow-950 shadow-md">
                                    <Check className="h-4 w-4" />
                                    In stock
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center">
                        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-yellow-950 sm:text-4xl lg:text-5xl">
                            {displayName}
                        </h1>

                        <div className="mb-6 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${
                                            i < Math.floor(rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-yellow-200"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-medium text-yellow-900/70">
                                {rating.toFixed(1)} ({reviewCount} reviews)
                            </span>
                        </div>

                        <div className="mb-6 rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50/80 p-6 shadow-sm">
                            <div className="flex flex-wrap items-baseline gap-3">
                                <span className="text-3xl font-bold tabular-nums text-yellow-950 sm:text-4xl">
                                    ৳ {price}
                                </span>
                                {originalPrice > price && (
                                    <span className="text-lg text-yellow-900/40 line-through">
                                        ৳ {originalPrice}
                                    </span>
                                )}
                            </div>
                            {saveAmount > 0 && (
                                <p className="mt-2 text-sm font-medium text-yellow-800">
                                    You save ৳ {saveAmount}
                                </p>
                            )}
                        </div>

                        <p className="mb-8 text-lg leading-relaxed text-yellow-900/75">
                            {product.description}
                        </p>

                        {features.length > 0 && (
                            <div className="mb-8">
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-yellow-900/50">
                                    Key features
                                </h3>
                                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {features.slice(0, 4).map((feature, idx) => (
                                        <li
                                            key={idx}
                                            className="flex items-start gap-3 rounded-xl border border-yellow-100/80 bg-white/60 px-3 py-2.5"
                                        >
                                            <Check className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                                            <span className="text-yellow-950/90">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mb-8">
                            <label className="mb-3 block text-sm font-semibold text-yellow-950">
                                Quantity
                            </label>
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="inline-flex items-center overflow-hidden rounded-xl border border-yellow-200 bg-white shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity(Math.max(1, quantity - 1))
                                        }
                                        className="px-4 py-2.5 font-semibold text-yellow-900 transition hover:bg-yellow-50"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) =>
                                            setQuantity(
                                                Math.max(
                                                    1,
                                                    parseInt(e.target.value, 10) ||
                                                        1
                                                )
                                            )
                                        }
                                        className="w-16 border-x border-yellow-100 py-2.5 text-center font-semibold text-yellow-950 focus:outline-none"
                                        min="1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity(quantity + 1)
                                        }
                                        className="px-4 py-2.5 font-semibold text-yellow-900 transition hover:bg-yellow-50"
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="text-yellow-900/70">
                                    Line total:{" "}
                                    <span className="font-bold tabular-nums text-yellow-950">
                                        ৳ {price * quantity}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-500 px-8 py-4 font-semibold text-yellow-950 shadow-lg shadow-yellow-900/10 transition hover:bg-yellow-600"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                Add to cart
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsFavorite(!isFavorite)}
                                className={`inline-flex items-center justify-center rounded-xl border-2 px-5 py-4 font-semibold transition ${
                                    isFavorite
                                        ? "border-rose-300 bg-rose-50 text-rose-600"
                                        : "border-yellow-200 bg-white text-yellow-800 hover:border-yellow-400"
                                }`}
                                aria-label={
                                    isFavorite
                                        ? "Remove from favorites"
                                        : "Add to favorites"
                                }
                            >
                                <Heart
                                    className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
                                />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 border-t border-yellow-100 pt-8 sm:grid-cols-3">
                            {[
                                {
                                    icon: Truck,
                                    title: "Fast delivery",
                                    sub: "Reliable shipping",
                                },
                                {
                                    icon: Shield,
                                    title: "Secure checkout",
                                    sub: "Encrypted payments",
                                },
                                {
                                    icon: RotateCcw,
                                    title: "Support",
                                    sub: "We are here to help",
                                },
                            ].map((row) => {
                                const TrustIcon = row.icon;
                                return (
                                <div
                                    key={row.title}
                                    className="flex items-start gap-3 rounded-xl border border-yellow-100/80 bg-yellow-50/40 p-4"
                                >
                                    <TrustIcon className="h-6 w-6 shrink-0 text-yellow-600" />
                                    <div>
                                        <p className="font-semibold text-yellow-950">
                                            {row.title}
                                        </p>
                                        <p className="text-sm text-yellow-900/55">
                                            {row.sub}
                                        </p>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Specifications */}
                <div className="mb-12 rounded-3xl border border-yellow-100 bg-white p-8 shadow-lg shadow-yellow-900/5 sm:p-10">
                    <h2 className="mb-8 text-2xl font-bold text-yellow-950 sm:text-3xl">
                        Specifications
                    </h2>
                    {specEntries.length === 0 ? (
                        <p className="text-yellow-900/55">
                            No specifications listed.
                        </p>
                    ) : (
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {specEntries.map(([key, value]) => (
                                <div
                                    key={key}
                                    className="rounded-2xl border border-yellow-100 bg-gradient-to-br from-yellow-50/80 to-white p-5"
                                >
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-yellow-800/70">
                                        {key}
                                    </dt>
                                    <dd className="mt-2 text-lg font-bold text-yellow-950">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>

                {/* All features */}
                {features.length > 0 && (
                    <div className="rounded-3xl border border-yellow-200 bg-gradient-to-br from-yellow-50 via-amber-50/50 to-white p-8 sm:p-10">
                        <h2 className="mb-8 text-2xl font-bold text-yellow-950 sm:text-3xl">
                            Everything included
                        </h2>
                        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {features.map((feature, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center gap-3 rounded-xl border border-yellow-100/60 bg-white/70 px-4 py-3"
                                >
                                    <Check className="h-5 w-5 shrink-0 text-yellow-600" />
                                    <span className="font-medium text-yellow-950/90">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
