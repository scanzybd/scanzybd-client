import { useQuery } from "@tanstack/react-query";
import { CreditCard, Receipt } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";
import InfoRow from "../../../components/order/InfoRow";
import {
  formatBdt,
  formatDateTime,
  formatOrderNo,
  formatPaymentMethod,
  formatTransactionId,
} from "../../../lib/orderDisplayFormat";
import { cardSurface } from "../../../lib/uiClasses";

const Payment = () => {
  const axiosSecure = useAxiosSecure();

  const {
    data: payments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-payments"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/payment/my-payments");
      return res.data;
    },
  });

  if (isLoading) {
    return <SmartLoader label="Loading payment history..." />;
  }

  if (isError) {
    return (
      <p className="py-16 text-center text-red-600 dark:text-red-400">
        Failed to load payments
      </p>
    );
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-10rem)] max-w-4xl px-4 py-8 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
          My payment history
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {payments.length} successful payment{payments.length !== 1 ? "s" : ""}
        </p>
      </header>

      {payments.length === 0 ? (
        <div className={`mx-auto max-w-xl p-10 text-center ${cardSurface}`}>
          <CreditCard className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            No payments yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Successful payments will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const orderNo = payment.orderId?.orderNo;
            const txn = formatTransactionId(payment);

            return (
              <article
                key={payment._id}
                className={`${cardSurface} overflow-hidden transition-shadow hover:shadow-md`}
              >
                <div className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-900/60">
                    <Receipt className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                        {orderNo ? formatOrderNo(orderNo) : "Order unavailable"}
                      </h2>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Paid
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 px-3 dark:border-slate-600 dark:bg-slate-800/40">
                      <InfoRow
                        label="Paid on"
                        value={formatDateTime(payment.completedAt || payment.createdAt)}
                      />
                      <InfoRow label="Amount" value={formatBdt(payment.amount)} />
                      <InfoRow
                        label="Payment method"
                        value={formatPaymentMethod(payment.paymentMethod)}
                      />
                      {txn && <InfoRow label="Transaction ID" value={txn} mono />}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Payment;
