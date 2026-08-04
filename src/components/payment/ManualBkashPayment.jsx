import React, { useState } from "react";
import { QrCode } from "lucide-react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { sanitizeManualTransactionInput } from "../../lib/orderDisplayFormat";
import { btnPrimary, btnSecondary, fieldInput, textHeading, textMuted } from "../../lib/uiClasses";

/**
 * @param {{
 *   config: { qrImageUrl?: string, merchantNumber?: string, instructions?: string } | null,
 *   amount: number,
 *   orderId: string,
 *   onBack: () => void,
 *   onSuccess: (data: { paymentId: string, transactionId: string }) => void,
 * }} props
 */
export default function ManualBkashPayment({
  config,
  amount,
  orderId,
  onBack,
  onSuccess,
}) {
  const axiosSecure = useAxiosSecure();
  const [trx, setTrx] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleTrxChange = (e) => {
    setError("");
    setTrx(sanitizeManualTransactionInput(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (trx.length !== 8) {
      setError("Enter the last 8 characters of your bKash transaction ID");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data } = await axiosSecure.post("/api/payment/manual/submit", {
        orderId,
        transactionId: trx,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Submit failed");
      }

      onSuccess({
        paymentId: data.paymentId,
        transactionId: data.transactionId,
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
          <QrCode className="h-6 w-6 text-rose-600" />
        </div>
        <h2 className={`text-lg font-bold ${textHeading}`}>Pay with bKash (Manual)</h2>
        <p className={`mt-1 text-sm ${textMuted}`}>
          Scan the QR code, send the exact amount, then enter the last 8 characters of your
          Trx ID (letters or numbers).
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        {config?.qrImageUrl ? (
          <img
            src={config.qrImageUrl}
            alt="bKash payment QR"
            className="mx-auto max-h-52 w-auto rounded-xl border border-slate-100 object-contain dark:border-slate-700"
          />
        ) : (
          <div className="flex h-40 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500 dark:bg-slate-800">
            QR code not configured
          </div>
        )}

        <dl className="mt-4 space-y-2 text-sm">
          {config?.merchantNumber ? (
            <div className="flex justify-between gap-3">
              <dt className={textMuted}>bKash number</dt>
              <dd className="font-semibold tabular-nums">{config.merchantNumber}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3">
            <dt className={textMuted}>Amount</dt>
            <dd className="font-bold tabular-nums text-amber-700 dark:text-amber-400">
              ৳ {Number(amount).toLocaleString("en-BD")}
            </dd>
          </div>
        </dl>

        {config?.instructions ? (
          <p className={`mt-3 text-xs ${textMuted}`}>{config.instructions}</p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className={`mb-1 block text-sm font-medium ${textHeading}`}>
            Transaction ID (last 8 characters)
          </span>
          <input
            type="text"
            autoComplete="off"
            maxLength={8}
            placeholder="e.g. AB12CD34"
            value={trx}
            onChange={handleTrxChange}
            className={`${fieldInput} font-mono uppercase tracking-widest`}
          />
        </label>

        {error ? (
          <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="submit"
            disabled={submitting || trx.length !== 8}
            className={`${btnPrimary} sm:flex-1 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {submitting ? "Submitting…" : "Submit payment"}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className={`${btnSecondary} sm:flex-1 disabled:opacity-50`}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
