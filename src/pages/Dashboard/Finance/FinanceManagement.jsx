import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Wallet, Receipt, Plus, HandCoins } from "lucide-react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const fmt = (n) => `৳ ${Number(n || 0).toLocaleString()}`;

const settlementStatusClass = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "accepted") return "badge-success";
  if (v === "rejected") return "badge-error";
  return "badge-warning";
};

const FinanceManagement = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "operations",
    note: "",
  });

  const [settlementFilter, setSettlementFilter] = useState("pending");
  const [selectedSettlementId, setSelectedSettlementId] = useState(null);

  const {
    data: paidOrders = [],
    isLoading: loadingOrders,
    isError: ordersError,
  } = useQuery({
    queryKey: ["finance-paid-orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/finance/admin/paid-orders");
      return res.data?.orders || [];
    },
    retry: 1,
  });

  const {
    data: expenses = [],
    isLoading: loadingExpenses,
    isError: expensesError,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/expenses");
      return Array.isArray(res.data) ? res.data : [];
    },
    retry: 1,
  });

  const totalIncome = useMemo(
    () => paidOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
    [paidOrders]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + Number(e.amount || 0), 0),
    [expenses]
  );

  const net = totalIncome - totalExpenses;

  const {
    data: settlementRequests = [],
    isLoading: loadingSettlements,
    isError: settlementsError,
    refetch: refetchSettlements,
  } = useQuery({
    queryKey: ["admin-settlement-requests", settlementFilter],
    queryFn: async () => {
      const params = settlementFilter ? `?status=${settlementFilter}` : "";
      const res = await axiosSecure.get(
        `/api/finance/admin/settlement-requests${params}`
      );
      return res.data?.requests || [];
    },
    retry: 1,
  });

  const { data: settlementDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["admin-settlement-detail", selectedSettlementId],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/api/finance/admin/settlement-requests/${selectedSettlementId}`
      );
      return res.data;
    },
    enabled: Boolean(selectedSettlementId),
  });

  const acceptMutation = useMutation({
    mutationFn: (id) =>
      axiosSecure.patch(`/api/finance/admin/settlement-requests/${id}/accept`),
    onSuccess: () => {
      refetchSettlements();
      queryClient.invalidateQueries({
        queryKey: ["admin-settlement-detail", selectedSettlementId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-provider-dues"] });
      Swal.fire("Accepted", "Settlement request approved.", "success");
    },
    onError: (err) => {
      Swal.fire("Failed", err?.response?.data?.message || "Could not accept", "error");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, rejectNote }) =>
      axiosSecure.patch(`/api/finance/admin/settlement-requests/${id}/reject`, {
        rejectNote,
      }),
    onSuccess: () => {
      refetchSettlements();
      queryClient.invalidateQueries({
        queryKey: ["admin-settlement-detail", selectedSettlementId],
      });
      Swal.fire("Rejected", "Settlement request rejected.", "info");
    },
    onError: (err) => {
      Swal.fire("Failed", err?.response?.data?.message || "Could not reject", "error");
    },
  });

  const handleAccept = async (id) => {
    const result = await Swal.fire({
      title: "Accept settlement?",
      text: "Provider orders in this request will be marked as settled.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Accept",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      acceptMutation.mutate(id);
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: "Reject settlement?",
      input: "textarea",
      inputLabel: "Reject note (optional)",
      inputPlaceholder: "Reason for rejection…",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });
    if (result.isConfirmed) {
      rejectMutation.mutate({ id, rejectNote: result.value || "" });
    }
  };

  const expenseMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosSecure.post("/api/expenses", {
        title: form.title.trim(),
        amount: form.amount,
        category: form.category,
        note: form.note,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setForm({ title: "", amount: "", category: "operations", note: "" });
      Swal.fire("Saved", "Expense added.", "success");
    },
    onError: (err) => {
      Swal.fire(
        "Failed",
        err?.response?.data?.message || "Could not save expense.",
        "error"
      );
    },
  });

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;
    expenseMutation.mutate();
  };

  const detailRequest = settlementDetail?.request;
  const detailOrders = settlementDetail?.orders || [];
  const paymentSnap = detailRequest?.paymentSnapshot;
  const selectedIdStr = selectedSettlementId ? String(selectedSettlementId) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-12 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Finance Management</h1>
            <p className="mt-1 text-slate-600">
              Income from <span className="font-medium">paid</span> orders. Review settlements and
              expenses.
            </p>
          </div>
          <Link
            to="/dashboard/provider-due-list"
            className="btn btn-outline btn-sm gap-1"
          >
            <Wallet className="h-4 w-4" />
            Provider due list
          </Link>
        </div>

        {(ordersError || expensesError || settlementsError) && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {ordersError && "Could not load paid orders. "}
            {expensesError && "Could not load expenses. "}
            {settlementsError && "Could not load settlement requests. "}
            Refresh the page or restart the server if finance API was recently added.
          </div>
        )}

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <HandCoins className="h-5 w-5 text-amber-600" />
            Provider settlement requests
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Review date-range payout requests from providers. Accept or reject with an optional note.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select
              className="select select-bordered select-sm rounded-xl"
              value={settlementFilter}
              onChange={(e) => {
                setSettlementFilter(e.target.value);
                setSelectedSettlementId(null);
              }}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <span className="text-sm text-slate-500">
              {settlementRequests.length} request(s)
            </span>
          </div>

          {loadingSettlements ? (
            <div className="mt-4 py-8 text-center text-sm text-slate-500">
              Loading settlement requests…
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="max-h-[min(400px,55vh)] overflow-auto">
                <table className="table table-sm w-full">
                  <thead className="sticky top-0 z-[1] bg-slate-50">
                    <tr className="text-left text-xs uppercase text-slate-500">
                      <th>Provider</th>
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {settlementRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500">
                          No settlement requests.
                        </td>
                      </tr>
                    ) : (
                      settlementRequests.map((r) => (
                        <tr
                          key={String(r._id)}
                          className={
                            selectedIdStr === String(r._id) ? "bg-emerald-50" : ""
                          }
                        >
                          <td className="text-sm font-medium">
                            {r.providerId?.name || r.providerId?.email || "—"}
                          </td>
                          <td className="whitespace-nowrap text-xs text-slate-600">
                            {r.periodFrom
                              ? `${new Date(r.periodFrom).toLocaleDateString("en-GB")} – ${new Date(r.periodTo).toLocaleDateString("en-GB")}`
                              : "—"}
                          </td>
                          <td className="font-semibold text-emerald-700">{fmt(r.amount)}</td>
                          <td>
                            <span
                              className={`badge badge-sm ${settlementStatusClass(r.status)}`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() => setSelectedSettlementId(String(r._id))}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              {!selectedSettlementId ? (
                <p className="py-12 text-center text-sm text-slate-500">
                  Select a request to see payment details and orders.
                </p>
              ) : loadingDetail ? (
                <p className="py-12 text-center text-sm text-slate-500">Loading…</p>
              ) : !detailRequest ? (
                <p className="py-12 text-center text-sm text-rose-600">
                  Could not load request.
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase text-slate-500">Provider</p>
                    <p className="font-semibold text-slate-900">
                      {detailRequest.providerId?.name || "—"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {detailRequest.providerId?.email}
                      {detailRequest.providerId?.phone
                        ? ` · ${detailRequest.providerId.phone}`
                        : ""}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Period</p>
                      <p>
                        {new Date(detailRequest.periodFrom).toLocaleDateString("en-GB")} –{" "}
                        {new Date(detailRequest.periodTo).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Amount</p>
                      <p className="font-bold text-emerald-700">{fmt(detailRequest.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Orders</p>
                      <p>{detailRequest.orderCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Status</p>
                      <span
                        className={`badge badge-sm ${settlementStatusClass(detailRequest.status)}`}
                      >
                        {detailRequest.status}
                      </span>
                    </div>
                  </div>
                  {detailRequest.providerNote ? (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <span className="font-medium">Provider note:</span>{" "}
                      {detailRequest.providerNote}
                    </p>
                  ) : null}
                  {detailRequest.rejectNote ? (
                    <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
                      <span className="font-medium">Reject note:</span>{" "}
                      {detailRequest.rejectNote}
                    </p>
                  ) : null}
                  {paymentSnap && (
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                      <p className="mb-2 font-semibold text-slate-800">Payment details</p>
                      <p>
                        <span className="text-slate-500">Method:</span>{" "}
                        {paymentSnap.preferredMethod || "—"}
                      </p>
                      {paymentSnap.preferredMethod === "cash" &&
                      paymentSnap.moneyReceiptNo ? (
                        <p>
                          <span className="text-slate-500">Money receipt no:</span>{" "}
                          {paymentSnap.moneyReceiptNo}
                        </p>
                      ) : null}
                      {paymentSnap.bkashNumber ? (
                        <p>
                          <span className="text-slate-500">bKash:</span> {paymentSnap.bkashNumber}
                        </p>
                      ) : null}
                      {paymentSnap.bankName ? (
                        <p>
                          <span className="text-slate-500">Bank:</span> {paymentSnap.bankName}
                        </p>
                      ) : null}
                      {paymentSnap.accountHolder ? (
                        <p>
                          <span className="text-slate-500">Holder:</span>{" "}
                          {paymentSnap.accountHolder}
                        </p>
                      ) : null}
                      {paymentSnap.accountNumber ? (
                        <p>
                          <span className="text-slate-500">Account:</span>{" "}
                          {paymentSnap.accountNumber}
                        </p>
                      ) : null}
                      {paymentSnap.note ? (
                        <p>
                          <span className="text-slate-500">Note:</span> {paymentSnap.note}
                        </p>
                      ) : null}
                    </div>
                  )}
                  <div className="max-h-40 overflow-auto rounded-lg border border-slate-100">
                    <table className="table table-xs w-full">
                      <thead>
                        <tr className="text-xs text-slate-500">
                          <th>Order</th>
                          <th>Date</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailOrders.map((o) => (
                          <tr key={o._id}>
                            <td className="font-mono text-[10px]">
                              {o.orderNo || String(o._id).slice(-8)}
                            </td>
                            <td className="text-xs">
                              {o.createdAt
                                ? new Date(o.createdAt).toLocaleDateString("en-GB")
                                : "—"}
                            </td>
                            <td className="font-semibold">{fmt(o.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {detailRequest.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        className="btn btn-success btn-sm flex-1"
                        disabled={acceptMutation.isPending}
                        onClick={() => handleAccept(String(detailRequest._id))}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-error btn-sm flex-1"
                        disabled={rejectMutation.isPending}
                        onClick={() => handleReject(String(detailRequest._id))}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Income (paid)</span>
            </div>
            <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">{fmt(totalIncome)}</p>
            <p className="mt-1 text-xs text-slate-500">
              {loadingOrders ? "Loading…" : `${paidOrders.length} paid orders`}
            </p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-rose-700">
              <TrendingDown className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Expenses</span>
            </div>
            <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">{fmt(totalExpenses)}</p>
            <p className="mt-1 text-xs text-slate-500">{expenses.length} entries</p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-800">
              <Wallet className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Net</span>
            </div>
            <p
              className={`mt-3 text-2xl font-bold tabular-nums ${
                net >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {fmt(net)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Income − expenses</p>
          </div>
        </div>

        {/* Income — paid orders */}
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Receipt className="h-5 w-5 text-emerald-600" />
            Income (paid orders)
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="max-h-[min(360px,50vh)] overflow-auto">
              {loadingOrders ? (
                <div className="py-12 text-center text-sm text-slate-500">Loading orders…</div>
              ) : (
              <table className="table table-zebra w-full">
                <thead className="sticky top-0 z-[1] bg-slate-50">
                  <tr className="text-left text-sm">
                    <th className="font-semibold">Date</th>
                    <th className="font-semibold">Order</th>
                    <th className="font-semibold">Amount</th>
                    <th className="font-semibold">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {paidOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-500">
                        No paid orders yet.
                      </td>
                    </tr>
                  ) : (
                    paidOrders.map((o) => (
                      <tr key={o._id}>
                        <td className="whitespace-nowrap text-sm text-slate-600">
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="font-mono text-xs text-slate-700">
                          {o.orderNo || String(o._id).slice(-8)}
                        </td>
                        <td className="font-semibold tabular-nums text-emerald-700">
                          {fmt(o.totalAmount)}
                        </td>
                        <td>
                          <span className="badge badge-success badge-sm">
                            {o.paymentStatus || "paid"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </section>

        {/* Expenses */}
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <TrendingDown className="h-5 w-5 text-rose-600" />
            Expenses
          </h2>

          <form
            onSubmit={handleExpenseSubmit}
            className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4"
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">
                Title <span className="text-rose-500">*</span>
              </span>
              <input
                type="text"
                placeholder="e.g. Hosting"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input input-bordered w-full rounded-xl border-slate-200"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">
                Amount <span className="text-rose-500">*</span>
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="input input-bordered w-full rounded-xl border-slate-200"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="select select-bordered w-full rounded-xl border-slate-200"
              >
                <option value="operations">Operations</option>
                <option value="marketing">Marketing</option>
                <option value="logistics">Logistics</option>
                <option value="other">Other</option>
              </select>
            </label>
            <div className="flex gap-2 md:col-span-2 lg:col-span-1">
              <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                <span className="font-medium text-slate-600">Note (optional)</span>
                <input
                  type="text"
                  placeholder="Optional"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  className="input input-bordered min-w-0 flex-1 rounded-xl border-slate-200"
                />
              </label>
              <button
                type="submit"
                disabled={expenseMutation.isPending || expensesError}
                className="btn btn-primary shrink-0 gap-1 rounded-xl"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </form>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="max-h-[min(320px,45vh)] overflow-auto">
              {loadingExpenses ? (
                <div className="py-12 text-center text-sm text-slate-500">Loading expenses…</div>
              ) : (
              <table className="table table-zebra w-full">
                <thead className="sticky top-0 z-[1] bg-slate-50">
                  <tr className="text-left text-sm">
                    <th className="font-semibold">Date</th>
                    <th className="font-semibold">Title</th>
                    <th className="font-semibold">Category</th>
                    <th className="font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-500">
                        No expenses recorded. Add one above.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((e) => (
                      <tr key={e._id}>
                        <td className="whitespace-nowrap text-sm text-slate-600">
                          {e.createdAt
                            ? new Date(e.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="font-medium text-slate-800">{e.title}</td>
                        <td className="text-slate-600">{e.category}</td>
                        <td className="font-semibold tabular-nums text-rose-700">{fmt(e.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FinanceManagement;
