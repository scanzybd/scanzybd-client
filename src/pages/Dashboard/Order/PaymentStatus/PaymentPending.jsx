import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useCart from "../../../../hooks/useCart";

const PaymentPending = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const trxSuffix = params.get("trx");

  useEffect(() => {
    clearCart().catch(() => {});
  }, [clearCart]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 text-center shadow-md dark:bg-slate-900">
        <div className="text-5xl">⏳</div>

        <h1 className="text-xl font-bold text-amber-700 dark:text-amber-400">
          Payment under review
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          We received your bKash payment details. An admin will verify your transaction
          and confirm your order shortly.
        </p>

        {trxSuffix ? (
          <p className="font-mono text-sm text-slate-500">
            Transaction ID:{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{trxSuffix}</span>
          </p>
        ) : null}

        {orderId ? (
          <p className="text-xs text-slate-400">Order ref: {orderId.slice(-8)}</p>
        ) : null}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full rounded-lg bg-amber-500 py-2 font-medium text-slate-900 hover:bg-amber-600"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => navigate("/user/user-orders")}
            className="w-full rounded-lg bg-slate-200 py-2 dark:bg-slate-800"
          >
            My orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
