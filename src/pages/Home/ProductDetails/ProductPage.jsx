import React, { useState } from "react";
import ProductDetails from "./ProductDetails";

const ProductPage = () => {
    const [cart, setCart] = useState([]);

    const product = {
        id: 1,
        name: "QR Vehicle Tag Premium",
        price: 499,
        image: "https://via.placeholder.com/400",
        description:
            "This is a smart QR tag system for vehicle owners. Scan and connect instantly without sharing phone number.",
    };

    const handleAddToCart = (item) => {
        setCart([...cart, item]);
        alert("Added to cart!");
    };

    return (
        <div>
            <ProductDetails product={product} onAddToCart={handleAddToCart} />

            <p className="text-center mt-4">
                Cart Items: {cart.length}
            </p>
        </div>
    );
};

export default ProductPage;