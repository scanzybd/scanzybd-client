import React, { createContext, useEffect, useState } from "react";

const CartContext = createContext();

const CART_KEY = "cart";
const EXPIRY_KEY = "cart_expiry";

// 48 hours in milliseconds
const EXPIRY_TIME = 48 * 60 * 60 * 1000;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem(CART_KEY);
    const expiry = localStorage.getItem(EXPIRY_KEY);
    const now = new Date().getTime();

    if (storedCart && expiry) {
      if (now > Number(expiry)) {
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(EXPIRY_KEY);
        return [];
      }
      return JSON.parse(storedCart);
    }
    return [];
  });

  // 🔥 SAVE CART WITH 48H EXPIRY RESET
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
      localStorage.setItem(
        EXPIRY_KEY,
        (new Date().getTime() + EXPIRY_TIME).toString()
      );
    }
  }, [cartItems]);

  // ➕ ADD
  const addToCart = (item) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i._id === item._id);

      if (exists) {
        return prev.map((i) =>
          i._id === item._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // ➕ INCREASE
  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // ➖ DECREASE
  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // ❌ REMOVE
  const removeFromCart = (id) => {
    setCartItems((prev) =>
      prev.filter((item) => item._id !== id)
    );
  };

  // 🧹 CLEAR
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;