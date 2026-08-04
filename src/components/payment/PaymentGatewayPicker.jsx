import React from "react";
import { Smartphone, CreditCard, QrCode } from "lucide-react";

/**
 * @param {{ gateways: { bkash?: boolean, sslcommerz?: boolean, manualBkash?: boolean, defaultGateway?: string }, value: string, onChange: (g: string) => void, className?: string }} props
 */
export default function PaymentGatewayPicker({
  gateways,
  value,
  onChange,
  className = "",
}) {
  const showBkash = Boolean(gateways?.bkash);
  const showSsl = Boolean(gateways?.sslcommerz);
  const showManual = Boolean(gateways?.manualBkash);

  const optionCount = [showBkash, showSsl, showManual].filter(Boolean).length;

  if (optionCount === 0) {
    return (
      <p className={`text-sm text-rose-700 ${className}`}>
        Payment is temporarily unavailable. Please contact support.
      </p>
    );
  }

  if (optionCount === 1 && showManual) {
    return (
      <p className={`text-sm text-sky-700 dark:text-sky-300 ${className}`}>
        Pay by scanning the bKash QR code and entering your transaction ID.
      </p>
    );
  }

  if (optionCount === 1) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Choose payment method
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
            <span className="font-medium text-slate-800 dark:text-slate-100">
              bKash (Online)
            </span>
          </label>
        ) : null}
        {showManual ? (
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
              value === "manual_bkash"
                ? "border-sky-500 bg-sky-50 ring-1 ring-sky-500/30 dark:bg-sky-900/20"
                : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800"
            }`}
          >
            <input
              type="radio"
              name="paymentGateway"
              value="manual_bkash"
              checked={value === "manual_bkash"}
              onChange={() => onChange("manual_bkash")}
              className="radio radio-sm radio-info"
            />
            <QrCode className="h-5 w-5 text-sky-600" />
            <span className="font-medium text-slate-800 dark:text-slate-100">
              bKash (Manual QR)
            </span>
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
