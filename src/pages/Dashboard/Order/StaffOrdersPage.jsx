import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";
import { cardSurface, dashboardPageTitle, textMuted } from "../../../lib/uiClasses";
import { STAFF_ORDER_STATUS_OPTIONS, statusLabel } from "../../../lib/orderStatuses";

const fmt = (n) => `৳ ${Number(n || 0).toLocaleString()}`;

const statusClass = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "completed" || v === "delivered") return "badge-success";
  if (v === "processing" || v === "confirmed" || v === "shipped") return "badge-info";
  if (v === "cancelled" || v === "returned") return "badge-error";
  return "badge-warning";
};

const payClass = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "paid") return "badge-success";
  if (v === "failed") return "badge-error";
  return "badge-warning";
};

const methodLabel = (m) => {
  const map = {
    cash: "Cash",
    bkash_manual: "Manual bKash",
    bkash_online: "bKash Online",
    bkash: "bKash",
  };
  return map[String(m || "").toLowerCase()] || m || "—";
};

const StaffOrdersPage = () => {
  const axiosSecure = useAxiosSecure();
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = userRole === "admin";

  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusDraft, setStatusDraft] = useState({});
  const { data, isLoading } = useQuery({
    queryKey: ["staff-orders", status, paymentStatus, search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status) params.set("status", status);
      if (paymentStatus) params.set("paymentStatus", paymentStatus);
      if (search.trim()) params.set("search", search.trim());
      const res = await axiosSecure.get(`/api/order/staff-orders?${params}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId) => axiosSecure.delete(`/api/order/${orderId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-orders"] }),
    onError: (err) => {
      Swal.fire("Failed", err?.response?.data?.message || "Could not delete order", "error");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }) =>
      axiosSecure.patch(`/api/order/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
      setStatusDraft({});
    },
    onError: (err) => {
      alert(err?.response?.data?.message || "Status update failed");
    },
  });

  const draftStatus = (order) =>
    statusDraft[order._id] ?? String(order.status || "pending").toLowerCase();

  const canChangeStatus = (order) =>
    String(order?.paymentStatus || "").toLowerCase() !== "unpaid";

  const handleDelete = async (order) => {
    const result = await Swal.fire({
      title: "Delete order?",
      text: `Order #${order.orderNo} will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });
    if (result.isConfirmed) {
      deleteMutation.mutate(order._id);
    }
  };

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / (data?.limit || 20)));

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        String(o.orderNo || "").includes(q) ||
        String(o.userId?.name || "").toLowerCase().includes(q) ||
        String(o.userId?.email || "").toLowerCase().includes(q)
    );
  }, [orders, search]);

  if (isLoading) {
    return <SmartLoader fullPage label="Loading orders..." />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${dashboardPageTitle}`}>Orders</h1>
        <p className={`mt-1 text-sm ${textMuted}`}>
          {userRole === "provider"
            ? "Orders you created for customers"
            : "All staff and customer orders"}
        </p>
      </div>

      <div className={`${cardSurface} flex flex-wrap gap-3 p-4`}>
        <select
          className="select select-bordered select-sm rounded-lg"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="select select-bordered select-sm rounded-lg"
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="failed">Failed</option>
        </select>
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order # or customer…"
            className="input input-bordered input-sm w-full rounded-lg pl-9"
          />
        </div>
      </div>

      <div className={`${cardSurface} overflow-x-auto`}>
        <table className="table table-sm w-full">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-500">
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Pay status</th>
              <th>Status</th>
              <th className="min-w-[10rem]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o._id} className="text-sm">
                  <td className="font-mono font-semibold text-emerald-700">#{o.orderNo}</td>
                  <td>
                    <p className="font-medium">{o.userId?.name || "—"}</p>
                    <p className="text-xs text-slate-500">{o.userId?.email}</p>
                  </td>
                  <td className="whitespace-nowrap text-xs">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="font-semibold">{fmt(o.totalAmount)}</td>
                  <td>
                    <span className="badge badge-ghost badge-sm">
                      {methodLabel(o.paymentMethod)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-sm ${payClass(o.paymentStatus)}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-sm ${statusClass(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="align-top">
                    <div className="flex min-w-[9.5rem] flex-col gap-2 py-0.5">
                      {!canChangeStatus(o) && (
                        <p className="text-[10px] leading-tight text-amber-700">
                          Unpaid — status locked
                        </p>
                      )}
                      {isAdmin && canChangeStatus(o) ? (
                        <div className="flex w-full gap-1">
                          <select
                            className="select select-bordered select-xs h-8 min-h-0 flex-1 rounded-lg text-[11px]"
                            value={draftStatus(o)}
                            onChange={(e) =>
                              setStatusDraft((prev) => ({
                                ...prev,
                                [o._id]: e.target.value,
                              }))
                            }
                          >
                            {STAFF_ORDER_STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {statusLabel(s)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn btn-primary btn-xs h-8 min-h-0 shrink-0 rounded-lg px-2"
                            disabled={
                              statusMutation.isPending ||
                              draftStatus(o) === String(o.status || "").toLowerCase()
                            }
                            onClick={() =>
                              statusMutation.mutate({
                                orderId: o._id,
                                status: draftStatus(o),
                              })
                            }
                          >
                            {statusMutation.isPending &&
                            statusMutation.variables?.orderId === o._id
                              ? "…"
                              : "Save"}
                          </button>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-end gap-0.5 border-t border-slate-100 pt-1.5">
                        <Link
                          to={`/dashboard/orders/${o._id}`}
                          className="btn btn-ghost btn-xs h-7 min-h-0 gap-1 rounded-md px-2"
                          title="View order"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">View</span>
                        </Link>
                        {isAdmin && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs h-7 min-h-0 rounded-md px-2 text-rose-600 hover:bg-rose-50"
                            disabled={deleteMutation.isPending}
                            aria-label={`Delete order ${o.orderNo}`}
                            title="Delete order"
                            onClick={() => handleDelete(o)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            className="btn btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="self-center text-sm text-slate-600">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffOrdersPage;
