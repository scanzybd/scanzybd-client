import React, { createContext, useEffect, useState } from "react";

const CartContext = createContext();

const CART_KEY = "cart";
const EXPIRY_KEY = "cart_expiry";

// 48 hours in milliseconds
const EXPIRY_TIME = 48 * 60 * 60 * 1000;

function getCartItemId(itemOrId) {
  if (itemOrId == null) return "";
  if (typeof itemOrId === "object") {
    const id = itemOrId._id ?? itemOrId.id ?? itemOrId.productId;
    return id != null ? String(id) : "";
  }
  return String(itemOrId);
}

function normalizeCartItem(item) {
  const id = getCartItemId(item);
  if (!id) return null;
  return { ...item, _id: id, quantity: Math.max(1, Number(item.quantity) || 1) };
}

function loadCartFromStorage() {
  const storedCart = localStorage.getItem(CART_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);
  const now = Date.now();

  if (!storedCart || !expiry) return [];

  if (now > Number(expiry)) {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    return [];
  }

  try {
    const parsed = JSON.parse(storedCart);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeCartItem).filter(Boolean);
  } catch {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    return [];
  }
}

function persistCart(items) {
  if (items.length > 0) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + EXPIRY_TIME));
  } else {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  }
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadCartFromStorage);

  useEffect(() => {
    persistCart(cartItems);
  }, [cartItems]);

  const addToCart = (item) => {
    if (item?.isActive === false) return;
    const normalized = normalizeCartItem(item);
    if (!normalized) return;

    setCartItems((prev) => {
      const id = normalized._id;
      const exists = prev.find((i) => getCartItemId(i) === id);

      if (exists) {
        return prev.map((i) =>
          getCartItemId(i) === id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, normalized];
    });
  };

  const increaseQty = (id) => {
    const targetId = getCartItemId(id);
    setCartItems((prev) =>
      prev.map((item) =>
        getCartItemId(item) === targetId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id) => {
    const targetId = getCartItemId(id);
    setCartItems((prev) =>
      prev
        .map((item) =>
          getCartItemId(item) === targetId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    const targetId = getCartItemId(id);
    setCartItems((prev) =>
      prev.filter((item) => getCartItemId(item) !== targetId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
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