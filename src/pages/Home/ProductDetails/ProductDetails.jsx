import React, { useState } from "react";
import { ShoppingCart, Star, Check, Truck, Shield, RotateCcw, Heart } from "lucide-react";

const ProductDetails = ({ product, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);

    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            onAddToCart(product);
        }
        setQuantity(1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-8 flex items-center gap-2 text-sm text-slate-600">
                    <span className="hover:text-blue-600 cursor-pointer">Home</span>
                    <span>/</span>
                    <span className="hover:text-blue-600 cursor-pointer">Products</span>
                    <span>/</span>
                    <span className="text-blue-600 font-medium">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-16">
                    {/* Product Image Section */}
                    <div className="flex flex-col gap-4">
                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-80 sm:h-96 object-cover"
                            />
                            {discount > 0 && (
                                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                                    -{discount}%
                                </div>
                            )}
                            {product.inStock && (
                                <div className="absolute top-4 left-4 bg-emerald-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg flex items-center gap-1">
                                    <Check className="w-4 h-4" />
                                    In Stock
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info Section */}
                    <div className="flex flex-col justify-center">
                        {/* Title and Rating */}
                        <div className="mb-6">
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${
                                                i < Math.floor(product.rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-slate-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-slate-600 font-medium">
                                    {product.rating} ({product.reviews} reviews)
                                </span>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl sm:text-4xl font-bold text-slate-900">
                                    ৳ {product.price}
                                </span>
                                {product.originalPrice > product.price && (
                                    <span className="text-lg text-slate-400 line-through">
                                        ৳ {product.originalPrice}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-600 mt-2">
                                Save ৳ {product.originalPrice - product.price}
                            </p>
                        </div>

                        {/* Description */}
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            {product.description}
                        </p>

                        {/* Features List */}
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
                                Key Features
                            </h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {product.features.slice(0, 4).map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quantity Selector */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-slate-900 mb-3">
                                Quantity
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-slate-300 rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold transition"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-16 text-center py-2 font-semibold text-slate-900 focus:outline-none"
                                        min="1"
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold transition"
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="text-slate-600">
                                    Total: <span className="font-bold text-slate-900">৳ {product.price * quantity}</span>
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-amber-600 transition transform hover:scale-105 shadow-lg"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </button>
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className={`px-6 py-4 rounded-lg font-semibold border-2 transition ${
                                    isFavorite
                                        ? 'bg-red-50 border-red-300 text-red-600'
                                        : 'bg-white border-slate-300 text-slate-600 hover:border-red-300'
                                }`}
                            >
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200">
                            <div className="flex items-center gap-3">
                                <Truck className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="font-semibold text-slate-900">Free Shipping</p>
                                    <p className="text-sm text-slate-600">On orders above ৳999</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="font-semibold text-slate-900">Secure Payment</p>
                                    <p className="text-sm text-slate-600">100% protected</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <RotateCcw className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="font-semibold text-slate-900">Easy Returns</p>
                                    <p className="text-sm text-slate-600">30-day guarantee</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specifications Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
                        Specifications
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                        {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                                    {key}
                                </p>
                                <p className="text-lg font-bold text-slate-900">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* All Features */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-8 sm:p-12 border border-yellow-200">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
                        Complete Feature Set
                    </h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {product.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-3">
                                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                <span className="text-slate-700 font-medium">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;