import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Wallet, Receipt, Plus } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";

const fmt = (n) => `৳ ${Number(n || 0).toLocaleString()}`;

const FinanceManagement = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "operations",
    note: "",
  });

  const {
    data: paidOrders = [],
    isLoading: loadingOrders,
    isError: ordersError,
  } = useQuery({
    queryKey: ["finance-completed-orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order/completed");
      return res.data;
    },
  });

  const {
    data: expenses = [],
    isLoading: loadingExpenses,
    isError: expensesError,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/expenses");
      return res.data;
    },
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
    },
  });

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;
    expenseMutation.mutate();
  };

  const loading = loadingOrders || loadingExpenses;

  if (loading) {
    return <SmartLoader fullPage label="Loading finance data..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-12 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Finance Management</h1>
        <p className="mt-1 text-slate-600">
          Income is summed from <span className="font-medium">paid</span> orders. Track operating
          expenses below.
        </p>

        {(ordersError || expensesError) && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {ordersError && "Could not load orders. "}
            {expensesError && "Could not load expenses (provider/admin only). "}
            Refresh or check your session.
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Income (paid)</span>
            </div>
            <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">{fmt(totalIncome)}</p>
            <p className="mt-1 text-xs text-slate-500">{paidOrders.length} completed orders</p>
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
              <table className="table table-zebra w-full">
                <thead className="sticky top-0 z-[1] bg-slate-50">
                  <tr className="text-left text-sm">
                    <th className="font-semibold">Date</th>
                    <th className="font-semibold">Order</th>
                    <th className="font-semibold">Amount</th>
                    <th className="font-semibold">Status</th>
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
                          {String(o._id).slice(-8)}
                        </td>
                        <td className="font-semibold tabular-nums text-emerald-700">
                          {fmt(o.totalAmount)}
                        </td>
                        <td>
                          <span className="badge badge-success badge-sm">{o.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
            <input
              type="text"
              placeholder="Title (e.g. Hosting)"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input input-bordered w-full rounded-xl border-slate-200"
              required
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="input input-bordered w-full rounded-xl border-slate-200"
              required
            />
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
            <div className="flex gap-2 md:col-span-2 lg:col-span-1">
              <input
                type="text"
                placeholder="Note (optional)"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="input input-bordered min-w-0 flex-1 rounded-xl border-slate-200"
              />
              <button
                type="submit"
                disabled={expenseMutation.isPending}
                className="btn btn-primary shrink-0 gap-1 rounded-xl"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </form>
          {expenseMutation.isError && (
            <p className="mt-2 text-sm text-rose-600">
              {expenseMutation.error?.response?.data?.message || "Could not save expense."}
            </p>
          )}

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="max-h-[min(320px,45vh)] overflow-auto">
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
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FinanceManagement;
