import React, { useEffect } from "react";
import { Banknote, Smartphone, Globe, CreditCard } from "lucide-react";
import usePaymentGateways from "../../hooks/usePaymentGateways";
import { buildStaffPaymentOptions } from "../../lib/staffPaymentUtils";

const ICONS = {
  cash: Banknote,
  bkash_manual: Smartphone,
  bkash_online: Globe,
  sslcommerz_online: CreditCard,
};

/**
 * Payment method radios for admin/provider staff orders.
 */
export default function StaffPaymentMethodPicker({
  value,
  onChange,
  transactionId,
  onTransactionIdChange,
  orderNote,
  onOrderNoteChange,
  titleClassName = "",
  fieldInputClassName = "input input-bordered mt-1 w-full rounded-xl text-sm",
  cardClassName = "",
}) {
  const { data: gateways, isLoading } = usePaymentGateways();
  const options = buildStaffPaymentOptions(gateways);

  useEffect(() => {
    if (!gateways || isLoading) return;
    const ids = buildStaffPaymentOptions(gateways).map((o) => o.id);
    if (!ids.includes(value)) {
      onChange(ids[0] || "cash");
    }
  }, [gateways, isLoading, value, onChange]);

  return (
    <div className={cardClassName}>
      <h3 className={titleClassName || "mb-3 text-sm font-bold text-slate-900"}>
        Payment method
      </h3>
      {isLoading ? (
        <p className="text-xs text-slate-500">Loading payment options…</p>
      ) : (
        <div
          className={`grid gap-2 ${
            options.length <= 2
              ? "grid-cols-2"
              : options.length === 3
                ? "sm:grid-cols-3"
                : "sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {options.map(({ id, label }) => {
            const Icon = ICONS[id] || Globe;
            const selected = value === id;
            return (
              <label
                key={id}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-3 text-center text-xs font-semibold transition ${
                  selected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200"
                    : "border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="staffPaymentMethod"
                  value={id}
                  checked={selected}
                  onChange={() => onChange(id)}
                  className="sr-only"
                />
                <Icon className="h-5 w-5" />
                {label}
              </label>
            );
          })}
        </div>
      )}
      {value === "bkash_manual" && onTransactionIdChange ? (
        <label className="mt-3 block">
          <span className="text-xs font-medium text-slate-500">
            bKash Transaction ID *
          </span>
          <input
            className={fieldInputClassName}
            value={transactionId}
            onChange={(e) => onTransactionIdChange(e.target.value)}
            placeholder="e.g. DEC60OP75K"
          />
        </label>
      ) : null}
      {onOrderNoteChange ? (
        <input
          type="text"
          className={`${fieldInputClassName} mt-3`}
          value={orderNote}
          onChange={(e) => onOrderNoteChange(e.target.value)}
          placeholder="Payment note (optional)"
        />
      ) : null}
      {!gateways?.hasAnyPayment && gateways && !isLoading ? (
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-300">
          No payment method is enabled. Ask admin to enable bKash, SSL, or manual
          bKash in Payment gateways.
        </p>
      ) : !gateways?.hasOnlinePayment && gateways?.manualBkash && !isLoading ? (
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          Online payment is off — customer checkout uses manual bKash QR. Staff can
          still use cash or manual bKash below.
        </p>
      ) : !gateways?.hasOnlinePayment && gateways && !isLoading ? (
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-300">
          No online gateway is enabled. Use cash or manual bKash, or ask admin to
          enable bKash/SSL in Payment gateways.
        </p>
      ) : null}
    </div>
  );
}
