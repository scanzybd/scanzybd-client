import React, { useState } from "react";
import { ShoppingCart, Trash2, Heart, Star, Filter, Search } from "lucide-react";
import product01 from "../../../assets/product/product01.png";
import product02 from "../../../assets/product/product02.png";

const ProductShowcase = () => {
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPrice, setFilterPrice] = useState("all");
    const [notification, setNotification] = useState(null);

    const products = [
        {
            id: 1,
            name: "QR Sticker Premium",
            price: 199,
            originalPrice: 299,
            image: product01,
            category: "Sticker",
            rating: 4.5,
            reviews: 128,
            inStock: true,
            badge: "Popular"
        },
        {
            id: 2,
            name: "Vehicle QR Tag Plate",
            price: 499,
            originalPrice: 699,
            image: product02,
            category: "Tag",
            rating: 4.8,
            reviews: 342,
            inStock: true,
            badge: "Best Seller"
        },
        {
            id: 3,
            name: "Digital Service Card",
            price: 299,
            originalPrice: 399,
            image: product01,
            category: "Card",
            rating: 4.3,
            reviews: 95,
            inStock: true,
            badge: "New"
        },
        {
            id: 4,
            name: "Pet ID Tag QR",
            price: 149,
            originalPrice: 249,
            image: product02,
            category: "Pet",
            rating: 4.6,
            reviews: 201,
            inStock: true,
            badge: ""
        },
    ];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice = 
            filterPrice === "all" ||
            (filterPrice === "under300" && product.price < 300) ||
            (filterPrice === "300-500" && product.price >= 300 && product.price <= 500) ||
            (filterPrice === "above500" && product.price > 500);
        return matchesSearch && matchesPrice;
    });

    const addToCart = (product) => {
        setCart((prev) => [...prev, product]);
        showNotification("success", `${product.name} added to cart!`);
    };

    const removeFromCart = (index) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
        showNotification("success", "Item removed from cart!");
    };

    const toggleWishlist = (id) => {
        setWishlist((prev) => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
    const discountPrice = totalPrice > 0 ? Math.round(totalPrice * 0.1) : 0;

    return (
        <div className="w-full bg-gradient-to-b from-slate-50 via-white to-slate-50">
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in">
                    <div className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
                        notification.type === 'success' 
                            ? 'bg-emerald-500' 
                            : 'bg-red-500'
                    }`}>
                        {notification.message}
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                        Featured Products
                    </h1>
                    <p className="text-lg text-gray-800 max-w-2xl mx-auto">
                        Explore our premium collection of QR-based smart solutions for your needs
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Products Section */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Search and Filter */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-300 rounded-lg">
                                    <Filter className="w-5 h-5 text-slate-600" />
                                    <select
                                        value={filterPrice}
                                        onChange={(e) => setFilterPrice(e.target.value)}
                                        className="focus:outline-none bg-white"
                                    >
                                        <option value="all">All Prices</option>
                                        <option value="under300">Under ৳300</option>
                                        <option value="300-500">৳300 - ৳500</option>
                                        <option value="above500">Above ৳500</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition overflow-hidden group"
                                >
                                    {/* Product Image */}
                                    <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-100">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                        />
                                        {product.badge && (
                                            <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                                                {product.badge}
                                            </div>
                                        )}
                                        {!product.inStock && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="text-white font-bold">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-bold text-slate-900 flex-1">
                                                {product.name}
                                            </h3>
                                            <button
                                                onClick={() => toggleWishlist(product.id)}
                                                className="ml-2 p-2 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Heart
                                                    className={`w-5 h-5 ${
                                                        wishlist.includes(product.id)
                                                            ? 'fill-red-500 text-red-500'
                                                            : 'text-slate-400'
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        {/* Category and Rating */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-medium text-amber-700 bg-yellow-100 px-2 py-1 rounded">
                                                {product.category}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${
                                                                i < Math.floor(product.rating)
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-slate-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-slate-600">({product.reviews})</span>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-2xl font-bold text-slate-900">
                                                ৳ {product.price}
                                            </span>
                                            <span className="text-sm text-slate-400 line-through">
                                                ৳ {product.originalPrice}
                                            </span>
                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                                Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                            </span>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={() => addToCart(product)}
                                            disabled={!product.inStock}
                                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition transform hover:scale-105 ${
                                                product.inStock
                                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 hover:from-yellow-500 hover:to-amber-600'
                                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12">
                                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-xl text-slate-600">No products found</p>
                                <p className="text-slate-500">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>

                    {/* Cart Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <ShoppingCart className="w-6 h-6 text-yellow-600" />
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Cart
                                </h2>
                                <span className="ml-auto bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                                    {cart.length}
                                </span>
                            </div>

                            {cart.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">Your cart is empty</p>
                                </div>
                            ) : (
                                <>
                                    {/* Cart Items */}
                                    <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                                        {cart.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900 text-sm">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-yellow-600 font-semibold mt-1">
                                                        ৳ {item.price}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(index)}
                                                    className="ml-2 p-1.5 hover:bg-red-100 rounded transition"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Price Summary */}
                                    <div className="space-y-3 pt-4 border-t border-slate-200">
                                        <div className="flex justify-between text-slate-600">
                                            <span>Subtotal</span>
                                            <span>৳ {totalPrice}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-600 font-semibold">
                                            <span>Discount (10%)</span>
                                            <span>-৳ {discountPrice}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
                                            <span>Total</span>
                                            <span>৳ {totalPrice - discountPrice}</span>
                                        </div>
                                    </div>

                                    {/* Checkout Button */}
                                    <button className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition transform hover:scale-105 shadow-lg">
                                        Proceed to Checkout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductShowcase;