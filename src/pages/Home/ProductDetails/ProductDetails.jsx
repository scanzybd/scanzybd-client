import React from "react";

const ProductDetails = ({ product, onAddToCart }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

            <div className="max-w-4xl w-full bg-white shadow-lg rounded-2xl p-6 md:flex gap-6">

                {/* Product Image */}
                <div className="md:w-1/2">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-80 object-cover rounded-xl"
                    />
                </div>

                {/* Product Info */}
                <div className="md:w-1/2 flex flex-col justify-center">

                    <h1 className="text-3xl font-bold text-gray-800">
                        {product.name}
                    </h1>

                    <p className="text-gray-600 mt-3 leading-relaxed">
                        {product.description}
                    </p>

                    <p className="text-2xl font-semibold text-blue-600 mt-4">
                        ৳ {product.price}
                    </p>

                    <button
                        onClick={() => onAddToCart(product)}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg transition"
                    >
                        Add to Cart
                    </button>

                </div>

            </div>
        </div>
    );
};

export default ProductDetails;