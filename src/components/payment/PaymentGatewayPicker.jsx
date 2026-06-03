import React from "react";
import { Smartphone, CreditCard } from "lucide-react";

/**
 * @param {{ gateways: { bkash?: boolean, sslcommerz?: boolean, defaultGateway?: string, enabled?: string[] }, value: string, onChange: (g: string) => void, className?: string }} props
 */
export default function PaymentGatewayPicker({
  gateways,
  value,
  onChange,
  className = "",
}) {
  const showBkash = Boolean(gateways?.bkash);
  const showSsl = Boolean(gateways?.sslcommerz);

  if (!showBkash && !showSsl) {
    return (
      <p className={`text-sm text-rose-700 ${className}`}>
        Online payment is temporarily unavailable. Please contact support.
      </p>
    );
  }

  if (showBkash && !showSsl) return null;
  if (!showBkash && showSsl) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Pay with
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {showBkash ? (
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
              value === "bkash"
                ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500/30 dark:bg-amber-900/20"
                : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800"
            }`}
          >
            <input
              type="radio"
              name="paymentGateway"
              value="bkash"
              checked={value === "bkash"}
              onChange={() => onChange("bkash")}
              className="radio radio-sm radio-warning"
            />
            <Smartphone className="h-5 w-5 text-rose-600" />
            <span className="font-medium text-slate-800 dark:text-slate-100">bKash</span>
          </label>
        ) : null}
        {showSsl ? (
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
              value === "sslcommerz"
                ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/30 dark:bg-emerald-900/20"
                : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800"
            }`}
          >
            <input
              type="radio"
              name="paymentGateway"
              value="sslcommerz"
              checked={value === "sslcommerz"}
              onChange={() => onChange("sslcommerz")}
              className="radio radio-sm radio-success"
            />
            <CreditCard className="h-5 w-5 text-emerald-700" />
            <span className="font-medium text-slate-800 dark:text-slate-100">
              Card / SSL Commerz
            </span>
          </label>
        ) : null}
      </div>
    </div>
  );
}
