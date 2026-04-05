import React, { useState } from "react";

const ProductShowcase = () => {
    const [cart, setCart] = useState([]);

    const products = [
        {
            id: 1,
            name: "QR Sticker Premium",
            price: 199,
            image: "https://via.placeholder.com/150",
        },
        {
            id: 2,
            name: "Vehicle QR Tag Plate",
            price: 499,
            image: "https://via.placeholder.com/150",
        },
        {
            id: 3,
            name: "Digital Service Card",
            price: 299,
            image: "https://via.placeholder.com/150",
        },
    ];

    const addToCart = (product) => {
        setCart((prev) => [...prev, product]);
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
                Product Showcase
            </h1>

            {/* Products */}
            <div className="grid md:grid-cols-3 gap-6">

                {products.map((product) => (
                    <div key={product.id} className="bg-white shadow-md rounded-xl p-4">

                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-40 object-cover rounded-lg"
                        />

                        <h2 className="text-xl font-semibold mt-3">
                            {product.name}
                        </h2>

                        <p className="text-gray-600">৳ {product.price}</p>

                        <button
                            onClick={() => addToCart(product)}
                            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>

            {/* Cart Section */}
            <div className="mt-10 bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-4">
                    🛒 Cart ({cart.length})
                </h2>

                {cart.length === 0 ? (
                    <p className="text-gray-500">Cart is empty</p>
                ) : (
                    cart.map((item, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center border-b py-2"
                        >
                            <span>{item.name}</span>
                            <span>৳ {item.price}</span>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 text-sm"
                            >
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductShowcase;