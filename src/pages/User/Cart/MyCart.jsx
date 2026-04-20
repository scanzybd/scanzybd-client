import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../../../hooks/useCart";
import {
  shellPage,
  cardSurface,
  btnPrimaryInline,
  textHeading,
  textMuted,
} from "../../../lib/uiClasses";

const MyCart = () => {
  const {
    cartItems,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
  }, [cartItems]);

  return (
    <div className={`mx-auto flex min-h-screen max-w-5xl flex-col p-6 ${shellPage}`}>
      <h1 className={`mb-6 text-3xl font-bold tracking-tight ${textHeading}`}>
        My Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="py-20 text-center">
          <p className={`text-lg ${textMuted}`}>Your cart is empty</p>

          <button
            type="button"
            onClick={() => navigate("/Products")}
            className={`mt-4 ${btnPrimaryInline} px-6`}
          >
            Go shopping
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._id || item.id || item.productId}
                className={`flex flex-wrap items-center justify-between gap-4 p-4 ${cardSurface}`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.title || item.name}
                    className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-600"
                  />

                  <div>
                    <h2 className={`font-semibold ${textHeading}`}>
                      {item.title || item.name}
                    </h2>
                    <p className={textMuted}>৳ {item.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      item.quantity > 1 && decreaseQty(item._id)
                    }
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    -
                  </button>

                  <span className={`tabular-nums ${textHeading}`}>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() => increaseQty(item._id)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>

                <div className={`font-semibold ${textHeading}`}>
                  ৳ {item.price * item.quantity}
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item._id)}
                  className="font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div
            className={`mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-100/80 p-6 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row`}
          >
            <div>
              <p className={textMuted}>Total items: {totalItems}</p>

              <p className={`text-2xl font-bold text-amber-700 dark:text-amber-400`}>
                Total: ৳ {totalPrice}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={clearCart}
                className="rounded-xl border border-rose-200 bg-white px-5 py-2.5 font-medium text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/50 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-slate-800"
              >
                Clear cart
              </button>

              <button
                type="button"
                onClick={() => navigate("/user/checkout")}
                className={`${btnPrimaryInline} px-6`}
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyCart;
