import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";
import { cardSurface, textHeading, textMuted } from "../../../lib/uiClasses";
import { STAFF_ORDER_STATUS_OPTIONS, statusLabel } from "../../../lib/orderStatuses";

const fmt = (n) => `৳ ${Number(n || 0).toLocaleString()}`;

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = userRole === "admin";

  const [trx, setTrx] = useState("");
  const [payStatus, setPayStatus] = useState("paid");
  const [note, setNote] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/order/${orderId}`);
      return res.data;
    },
    enabled: Boolean(orderId),
  });

  const order = data?.order;
  const payment = data?.payment;

  const deleteMutation = useMutation({
    mutationFn: () => axiosSecure.delete(`/api/order/${orderId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
      navigate("/dashboard/orders");
    },
    onError: (err) => {
      Swal.fire("Failed", err?.response?.data?.message || "Could not delete order", "error");
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) =>
      axiosSecure.patch(`/api/order/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] });
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
      alert("Order status updated.");
    },
    onError: (err) => {
      alert(err?.response?.data?.message || "Status update failed");
    },
  });

  const paymentMutation = useMutation({
    mutationFn: () =>
      axiosSecure.patch(`/api/order/${orderId}/payment`, {
        transactionId: trx,
        paymentStatus: payStatus,
        note,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] });
      alert("Payment updated.");
    },
    onError: (err) => {
      alert(err?.response?.data?.message || "Update failed");
    },
  });

  if (isLoading) {
    return <SmartLoader fullPage label="Loading order..." />;
  }

  if (!order) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        Order not found.
      </div>
    );
  }

  const currentStatus =
    orderStatus || String(order.status || "pending").toLowerCase();

  const paymentUnpaid =
    String(order.paymentStatus || "").toLowerCase() === "unpaid";

  const handleDelete = async () => {
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
      deleteMutation.mutate();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/dashboard/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className={`${cardSurface} p-6`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-bold ${textHeading}`}>Order #{order.orderNo}</h1>
            <p className={`mt-1 text-sm ${textMuted}`}>
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              className="btn btn-ghost btn-sm text-rose-600 hover:bg-rose-50"
              disabled={deleteMutation.isPending}
              aria-label="Delete order"
              onClick={handleDelete}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className={textMuted}>Customer</dt>
            <dd className="font-medium">
              {order.userId?.name} ({order.userId?.email})
            </dd>
          </div>
          <div>
            <dt className={textMuted}>Total</dt>
            <dd className="font-bold text-emerald-700">{fmt(order.totalAmount)}</dd>
          </div>
          <div>
            <dt className={textMuted}>Order status</dt>
            <dd className="capitalize">{order.status}</dd>
          </div>
          <div>
            <dt className={textMuted}>Payment status</dt>
            <dd className="capitalize">{order.paymentStatus}</dd>
          </div>
          <div>
            <dt className={textMuted}>Payment method</dt>
            <dd className="capitalize">{order.paymentMethod || "—"}</dd>
          </div>
        </dl>

        {paymentUnpaid && (
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Payment unpaid — order status cannot be changed until payment is paid (e.g. via
            Create order flow or bKash callback).
          </p>
        )}
        {isAdmin && !paymentUnpaid && (
          <div className="mt-6 flex flex-wrap items-end gap-2">
            <label className="block">
              <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                Change status
              </span>
              <select
                className="select select-bordered select-sm rounded-lg"
                value={currentStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
              >
                {STAFF_ORDER_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={
                statusMutation.isPending ||
                currentStatus === String(order.status || "").toLowerCase()
              }
              onClick={() => statusMutation.mutate(currentStatus)}
            >
              {statusMutation.isPending ? "Saving…" : "Update status"}
            </button>
          </div>
        )}
      </div>

      <div className={`${cardSurface} p-6`}>
        <h2 className={`text-lg font-bold ${textHeading}`}>Line items</h2>
        <ul className="mt-3 divide-y text-sm">
          {(order.items || []).map((item, i) => (
            <li key={i} className="flex justify-between py-2">
              <span>
                {item.title} × {item.quantity}
              </span>
              <span className="font-medium">{fmt(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${cardSurface} p-6`}>
        <h2 className={`text-lg font-bold ${textHeading}`}>Tag / vehicles</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(order.tagAssignments || []).map((tag, i) => (
            <li key={i} className="rounded-lg bg-slate-50 px-3 py-2">
              {tag.productTitle || tag.productId} — vehicle{" "}
              {tag.vehicleId?.plate || String(tag.vehicleId).slice(-6)}
            </li>
          ))}
          {order.tagAssignments?.length === 0 && (
            <p className={textMuted}>No tag assignments.</p>
          )}
        </ul>
      </div>

      {payment && (
        <div className={`${cardSurface} p-6`}>
          <h2 className={`text-lg font-bold ${textHeading}`}>Payment record</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={textMuted}>Status</span>
              <span className="capitalize">{payment.status}</span>
            </div>
            <div className="flex justify-between">
              <span className={textMuted}>Method</span>
              <span>{payment.paymentMethod}</span>
            </div>
            {payment.transactionId && (
              <div className="flex justify-between">
                <span className={textMuted}>Trx ID</span>
                <span className="font-mono text-xs">{payment.transactionId}</span>
              </div>
            )}
            {payment.note && (
              <div>
                <span className={textMuted}>Note</span>
                <p>{payment.note}</p>
              </div>
            )}
          </dl>
        </div>
      )}

      {isAdmin && (
        <div className={`${cardSurface} p-6`}>
          <h2 className={`text-lg font-bold ${textHeading}`}>Update payment (admin)</h2>
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={trx}
              onChange={(e) => setTrx(e.target.value)}
              placeholder="Transaction ID"
              className="input input-bordered w-full rounded-xl"
            />
            <select
              value={payStatus}
              onChange={(e) => setPayStatus(e.target.value)}
              className="select select-bordered w-full rounded-xl"
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="failed">Failed</option>
            </select>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note"
              className="input input-bordered w-full rounded-xl"
            />
            <button
              type="button"
              className="btn btn-primary rounded-xl"
              disabled={paymentMutation.isPending}
              onClick={() => paymentMutation.mutate()}
            >
              Save payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
