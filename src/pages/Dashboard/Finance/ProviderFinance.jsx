import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";
import { cardSurface, dashboardPageTitle, textMuted } from "../../../lib/uiClasses";

const fmt = (n) => `৳ ${Number(n || 0).toLocaleString()}`;

const statusBadge = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "accepted") return "badge-success";
  if (v === "rejected") return "badge-error";
  return "badge-warning";
};

function RequiredStar() {
  return (
    <span className="text-rose-600 dark:text-rose-400" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

function validatePaymentForm(form) {
  const method = form.preferredMethod;
  if (method === "bkash" && !form.bkashNumber.trim()) {
    return "bKash number is required";
  }
  if (method === "bank") {
    if (!form.bankName.trim()) return "Bank name is required";
    if (!form.accountHolder.trim()) return "Account holder is required";
    if (!form.accountNumber.trim()) return "Account number is required";
  }
  if (method === "cash" && !form.moneyReceiptNo.trim()) {
    return "Money receipt number is required";
  }
  return null;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const emptyPaymentForm = {
  bkashNumber: "",
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  moneyReceiptNo: "",
  preferredMethod: "bkash",
  note: "",
};

const ProviderFinance = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  const [periodFrom, setPeriodFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [periodTo, setPeriodTo] = useState(todayIso);
  const [requestNote, setRequestNote] = useState("");

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["provider-finance-summary"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/finance/provider/summary");
      return res.data;
    },
  });

  const { data: paymentData } = useQuery({
    queryKey: ["provider-payment-details"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/finance/provider/payment-details");
      return res.data?.profile;
    },
  });

  React.useEffect(() => {
    if (!paymentData) return;
    setPaymentForm({
      bkashNumber: paymentData.bkashNumber || "",
      bankName: paymentData.bankName || "",
      accountHolder: paymentData.accountHolder || "",
      accountNumber: paymentData.accountNumber || "",
      moneyReceiptNo: paymentData.moneyReceiptNo || "",
      preferredMethod: paymentData.preferredMethod || "bkash",
      note: paymentData.note || "",
    });
  }, [paymentData]);

  const { data: preview, isFetching: previewLoading } = useQuery({
    queryKey: ["provider-finance-preview", periodFrom, periodTo],
    queryFn: async () => {
      const params = new URLSearchParams({ from: periodFrom, to: periodTo });
      const res = await axiosSecure.get(`/api/finance/provider/orders?${params}`);
      return res.data;
    },
    enabled: Boolean(periodFrom && periodTo),
  });

  const requestMutation = useMutation({
    mutationFn: () =>
      axiosSecure.post("/api/finance/provider/settlement-requests", {
        from: periodFrom,
        to: periodTo,
        providerNote: requestNote.trim(),
        ...paymentForm,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-finance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["provider-finance-preview"] });
      queryClient.invalidateQueries({ queryKey: ["provider-payment-details"] });
      setRequestNote("");
      Swal.fire("Submitted", "Settlement request sent to admin.", "success");
    },
    onError: (err) => {
      Swal.fire("Failed", err?.response?.data?.message || "Request failed", "error");
    },
  });

  const handleRequest = async () => {
    const paymentError = validatePaymentForm(paymentForm);
    if (paymentError) {
      Swal.fire("Required", paymentError, "warning");
      return;
    }
    if (!periodFrom || !periodTo) {
      Swal.fire("Required", "Select from and to dates.", "warning");
      return;
    }
    if (!preview?.orderCount) {
      Swal.fire("No orders", "No unsettled paid orders in this date range.", "info");
      return;
    }

    const result = await Swal.fire({
      title: "Submit settlement request?",
      html: `<p class="text-sm">Period: <strong>${periodFrom}</strong> → <strong>${periodTo}</strong><br/>Amount: <strong>${fmt(preview?.amount)}</strong> (${preview?.orderCount || 0} orders)</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, submit",
      cancelButtonText: "No",
    });
    if (result.isConfirmed) {
      requestMutation.mutate();
    }
  };

  const daily = useMemo(
    () => summary?.dailyBreakdown || [],
    [summary?.dailyBreakdown]
  );

  const settlements = summary?.settlements || [];

  const payMethod = paymentForm.preferredMethod;
  const showBkash = payMethod === "bkash";
  const showBank = payMethod === "bank";
  const showCash = payMethod === "cash";

  if (loadingSummary) {
    return <SmartLoader fullPage label="Loading finance..." />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${dashboardPageTitle}`}>My Finance</h1>
        <p className={`mt-1 text-sm ${textMuted}`}>
          Paid orders you created · request settlement by date range
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={`${cardSurface} p-4`}>
          <p className={`text-xs uppercase ${textMuted}`}>Total earnings</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {fmt(summary?.totalEarnings)}
          </p>
        </div>
        <div className={`${cardSurface} p-4`}>
          <p className={`text-xs uppercase ${textMuted}`}>Unsettled</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {fmt(summary?.unsettledEarnings)}
          </p>
        </div>
        <div className={`${cardSurface} p-4`}>
          <p className={`text-xs uppercase ${textMuted}`}>Settled</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {fmt(summary?.settledEarnings)}
          </p>
        </div>
      </div>

      <div className={`${cardSurface} p-5`}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <Send className="h-5 w-5 text-emerald-600" />
          Settlement request
        </h2>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <label className="text-sm">
              <span className={textMuted}>
                From
                <RequiredStar />
              </span>
              <input
                type="date"
                required
                className="input input-bordered input-sm mt-1 block rounded-lg"
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className={textMuted}>
                To
                <RequiredStar />
              </span>
              <input
                type="date"
                required
                className="input input-bordered input-sm mt-1 block rounded-lg"
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
              />
            </label>
          </div>

          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
            {previewLoading ? (
              <span className={textMuted}>Calculating…</span>
            ) : (
              <>
                <p>
                  <span className={textMuted}>Orders in range:</span>{" "}
                  <strong>{preview?.orderCount || 0}</strong>
                </p>
                <p>
                  <span className={textMuted}>Request amount:</span>{" "}
                  <strong className="text-emerald-700">{fmt(preview?.amount)}</strong>
                </p>
              </>
            )}
          </div>

          <div className="border-t border-slate-200 pt-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Payment details</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className={textMuted}>
                  Payment method
                  <RequiredStar />
                </span>
                <select
                  required
                  className="select select-bordered select-sm mt-1 w-full rounded-lg"
                  value={paymentForm.preferredMethod}
                  onChange={(e) =>
                    setPaymentForm((f) => ({
                      ...f,
                      preferredMethod: e.target.value,
                    }))
                  }
                >
                  <option value="bkash">bKash</option>
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                </select>
              </label>

              {showBkash ? (
                <label className="block text-sm sm:col-span-2">
                  <span className={textMuted}>
                    bKash number
                    <RequiredStar />
                  </span>
                  <input
                    className="input input-bordered input-sm mt-1 w-full rounded-lg"
                    required
                    value={paymentForm.bkashNumber}
                    onChange={(e) =>
                      setPaymentForm((f) => ({ ...f, bkashNumber: e.target.value }))
                    }
                  />
                </label>
              ) : null}

              {showBank ? (
                <>
                  <label className="block text-sm">
                    <span className={textMuted}>
                      Bank name
                      <RequiredStar />
                    </span>
                    <input
                      className="input input-bordered input-sm mt-1 w-full rounded-lg"
                      required
                      value={paymentForm.bankName}
                      onChange={(e) =>
                        setPaymentForm((f) => ({ ...f, bankName: e.target.value }))
                      }
                    />
                  </label>
                  <label className="block text-sm">
                    <span className={textMuted}>
                      Account holder
                      <RequiredStar />
                    </span>
                    <input
                      className="input input-bordered input-sm mt-1 w-full rounded-lg"
                      required
                      value={paymentForm.accountHolder}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          accountHolder: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className={textMuted}>
                      Account number
                      <RequiredStar />
                    </span>
                    <input
                      className="input input-bordered input-sm mt-1 w-full rounded-lg"
                      required
                      value={paymentForm.accountNumber}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          accountNumber: e.target.value,
                        }))
                      }
                    />
                  </label>
                </>
              ) : null}

              {showCash ? (
                <label className="block text-sm sm:col-span-2">
                  <span className={textMuted}>
                    Money receipt no
                    <RequiredStar />
                  </span>
                  <input
                    className="input input-bordered input-sm mt-1 w-full rounded-lg"
                    required
                    value={paymentForm.moneyReceiptNo}
                    onChange={(e) =>
                      setPaymentForm((f) => ({
                        ...f,
                        moneyReceiptNo: e.target.value,
                      }))
                    }
                  />
                </label>
              ) : null}

              <label className="block text-sm sm:col-span-2">
                <span className={textMuted}>Note for admin (optional)</span>
                <input
                  type="text"
                  className="input input-bordered input-sm mt-1 w-full rounded-lg"
                  placeholder="Optional"
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-success btn-sm mt-5"
          disabled={
            requestMutation.isPending ||
            !preview?.orderCount ||
            previewLoading
          }
          onClick={handleRequest}
        >
          Submit settlement request
        </button>
      </div>

      <div className={`${cardSurface} overflow-x-auto p-5`}>
        <h2 className="mb-3 text-lg font-bold">Earnings by date</h2>
        <table className="table table-sm w-full">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-500">
              <th>Date</th>
              <th>Orders</th>
              <th>Total</th>
              <th>Unsettled</th>
            </tr>
          </thead>
          <tbody>
            {daily.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  No paid orders yet.
                </td>
              </tr>
            ) : (
              daily.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.count}</td>
                  <td className="font-semibold">{fmt(row.amount)}</td>
                  <td className="text-amber-700">{fmt(row.unsettled)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`${cardSurface} overflow-x-auto p-5`}>
        <h2 className="mb-3 text-lg font-bold">Settlement history</h2>
        <table className="table table-sm w-full">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-500">
              <th>Submitted</th>
              <th>Period</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {settlements.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No requests yet.
                </td>
              </tr>
            ) : (
              settlements.map((r) => (
                <tr key={r._id}>
                  <td className="text-xs whitespace-nowrap">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="text-xs whitespace-nowrap">
                    {r.periodFrom
                      ? `${new Date(r.periodFrom).toLocaleDateString("en-GB")} – ${new Date(r.periodTo).toLocaleDateString("en-GB")}`
                      : "—"}
                  </td>
                  <td className="font-semibold">{fmt(r.amount)}</td>
                  <td>
                    <span className={`badge badge-sm ${statusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="max-w-48 text-xs text-slate-600">
                    {r.status === "rejected" && r.rejectNote
                      ? `Rejected: ${r.rejectNote}`
                      : r.providerNote || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProviderFinance;
