import React, {
    createContext,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { getAppJwtIfValid } from "../../utils/appJwtStorage";

const CartContext = createContext();

const cartApi = axios.create({ baseURL: API_BASE_URL });

function authConfig() {
    const token = getAppJwtIfValid();
    if (!token) return null;
    return { headers: { Authorization: `Bearer ${token}` } };
}

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

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const itemsRef = useRef([]);

    useEffect(() => {
        itemsRef.current = cartItems;
    }, [cartItems]);

    const reloadCart = useCallback(async () => {
        const cfg = authConfig();
        if (!cfg) {
            setCartItems([]);
            return;
        }
        try {
            const res = await cartApi.get("/api/cart", cfg);
            setCartItems(Array.isArray(res.data?.items) ? res.data.items : []);
        } catch {
            setCartItems([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.removeItem("cart");
            localStorage.removeItem("cart_expiry");
        } catch {
            /* ignore legacy local cart */
        }
        reloadCart();
    }, [reloadCart]);

    const persistItems = useCallback(async (items) => {
        const cfg = authConfig();
        if (!cfg) return false;
        try {
            const res = await cartApi.put("/api/cart", { items }, cfg);
            setCartItems(Array.isArray(res.data?.items) ? res.data.items : []);
            return true;
        } catch {
            await reloadCart();
            return false;
        }
    }, [reloadCart]);

    const applyCartUpdate = useCallback(
        async (updater) => {
            const cfg = authConfig();
            if (!cfg) return false;
            const next = updater(itemsRef.current)
                .map(normalizeCartItem)
                .filter(Boolean);
            setCartItems(next);
            return persistItems(next);
        },
        [persistItems]
    );

    const addToCart = (item) => {
        if (item?.isActive === false) return;
        const normalized = normalizeCartItem(item);
        if (!normalized) return;

        void applyCartUpdate((prev) => {
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
        void applyCartUpdate((prev) =>
            prev.map((item) =>
                getCartItemId(item) === targetId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decreaseQty = (id) => {
        const targetId = getCartItemId(id);
        void applyCartUpdate((prev) =>
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
        void applyCartUpdate((prev) =>
            prev.filter((item) => getCartItemId(item) !== targetId)
        );
    };

    const clearCart = useCallback(async () => {
        const cfg = authConfig();
        if (cfg) {
            try {
                await cartApi.delete("/api/cart", cfg);
            } catch {
                /* ignore */
            }
        }
        setCartItems([]);
    }, []);

    const resetCartView = useCallback(() => {
        setCartItems([]);
    }, []);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                increaseQty,
                decreaseQty,
                removeFromCart,
                clearCart,
                reloadCart,
                resetCartView,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
