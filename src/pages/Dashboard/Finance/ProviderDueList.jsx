import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Users, ChevronRight } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";

const fmt = (n) => `৳ ${Number(n || 0).toLocaleString()}`;

const methodLabel = (m) => {
  const v = String(m || "").toLowerCase();
  if (v === "bkash") return "bKash";
  if (v === "bank") return "Bank";
  if (v === "cash") return "Cash";
  return "—";
};

const ProviderDueList = () => {
  const { t } = useTranslation();
  const axiosSecure = useAxiosSecure();
  const [selectedId, setSelectedId] = useState(null);
  const [showZeroDue, setShowZeroDue] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-provider-dues"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/finance/admin/provider-dues");
      return res.data;
    },
  });

  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ["admin-provider-due-detail", selectedId],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/api/finance/admin/provider-dues/${selectedId}`
      );
      return res.data;
    },
    enabled: Boolean(selectedId),
  });

  const providers = data?.providers || [];
  const totals = data?.totals || {};

  const filtered = useMemo(() => {
    if (showZeroDue) return providers;
    return providers.filter((p) => p.unsettledAmount > 0);
  }, [providers, showZeroDue]);

  if (isLoading) {
    return <SmartLoader fullPage label="Loading provider dues..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-12 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              {t("dashboard.menu.providerDue")}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Unsettled earnings from paid orders created by each provider
            </p>
          </div>
          <Link
            to="/dashboard/finance-management"
            className="btn btn-ghost btn-sm text-slate-600"
          >
            ← Finance
          </Link>
        </div>

        {isError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            Could not load provider dues. Refresh or check your session.
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              Total due
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-700">
              {fmt(totals.totalDue)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Providers with due
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totals.providersWithDue ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              All providers
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totals.providerCount ?? 0}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={showZeroDue}
              onChange={(e) => setShowZeroDue(e.target.checked)}
            />
            Show providers with zero due
          </label>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="max-h-[min(520px,65vh)] overflow-auto">
              <table className="table table-sm w-full">
                <thead className="sticky top-0 z-1 bg-slate-50">
                  <tr className="text-left text-xs uppercase text-slate-500">
                    <th>Provider</th>
                    <th>Due</th>
                    <th>Orders</th>
                    <th>Pending</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        No provider dues to show.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr
                        key={p.providerId}
                        className={
                          selectedId === p.providerId ? "bg-amber-50" : ""
                        }
                      >
                        <td>
                          <p className="font-medium text-slate-900">{p.name || "—"}</p>
                          <p className="text-xs text-slate-500">{p.email}</p>
                        </td>
                        <td className="font-semibold text-amber-700">
                          {fmt(p.unsettledAmount)}
                        </td>
                        <td>{p.unsettledOrderCount}</td>
                        <td>
                          {p.pendingRequestCount > 0 ? (
                            <span className="badge badge-warning badge-sm">
                              {p.pendingRequestCount}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs gap-1"
                            onClick={() => setSelectedId(p.providerId)}
                          >
                            Details
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {!selectedId ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                <Users className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm">Select a provider to view unsettled orders</p>
              </div>
            ) : loadingDetail ? (
              <p className="py-16 text-center text-sm text-slate-500">Loading…</p>
            ) : !detail?.provider ? (
              <p className="py-16 text-center text-sm text-rose-600">Could not load detail.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase text-slate-500">Provider</p>
                  <p className="text-lg font-bold text-slate-900">
                    {detail.provider.name}
                  </p>
                  <p className="text-sm text-slate-600">{detail.provider.email}</p>
                  {detail.provider.phone ? (
                    <p className="text-sm text-slate-600">{detail.provider.phone}</p>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-amber-50 px-3 py-2">
                    <p className="text-xs text-amber-800">Total due</p>
                    <p className="font-bold text-amber-700">
                      {fmt(detail.unsettledAmount)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Unsettled orders</p>
                    <p className="font-bold">{detail.unsettledOrderCount}</p>
                  </div>
                </div>
                {detail.paymentProfile ? (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                    <p className="mb-1 font-semibold text-slate-800">Payment profile</p>
                    <p>
                      <span className="text-slate-500">Method:</span>{" "}
                      {methodLabel(detail.paymentProfile.preferredMethod)}
                    </p>
                    {detail.paymentProfile.preferredMethod === "cash" &&
                    detail.paymentProfile.moneyReceiptNo ? (
                      <p>
                        <span className="text-slate-500">Receipt:</span>{" "}
                        {detail.paymentProfile.moneyReceiptNo}
                      </p>
                    ) : null}
                    {detail.paymentProfile.bkashNumber ? (
                      <p>
                        <span className="text-slate-500">bKash:</span>{" "}
                        {detail.paymentProfile.bkashNumber}
                      </p>
                    ) : null}
                    {detail.paymentProfile.bankName ? (
                      <p>
                        <span className="text-slate-500">Bank:</span>{" "}
                        {detail.paymentProfile.bankName} · {detail.paymentProfile.accountNumber}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No payment profile saved yet.</p>
                )}
                {detail.pendingRequests?.length > 0 ? (
                  <p className="text-sm text-amber-700">
                    {detail.pendingRequests.length} pending settlement request(s) — review in{" "}
                    <Link
                      to="/dashboard/finance-management"
                      className="font-medium underline"
                    >
                      Finance
                    </Link>
                  </p>
                ) : null}
                <div className="max-h-56 overflow-auto rounded-lg border border-slate-100">
                  <table className="table table-xs w-full">
                    <thead>
                      <tr className="text-xs text-slate-500">
                        <th>Order</th>
                        <th>Date</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.orders || []).length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-slate-500">
                            No unsettled orders.
                          </td>
                        </tr>
                      ) : (
                        detail.orders.map((o) => (
                          <tr key={o._id}>
                            <td className="font-mono text-[10px]">
                              {o.orderNo || String(o._id).slice(-8)}
                            </td>
                            <td className="text-xs whitespace-nowrap">
                              {o.createdAt
                                ? new Date(o.createdAt).toLocaleDateString("en-GB")
                                : "—"}
                            </td>
                            <td className="font-semibold">{fmt(o.totalAmount)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDueList;
