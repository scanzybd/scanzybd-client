import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Car, UserPlus, ShoppingBag } from "lucide-react";
import StaffPaymentMethodPicker from "../../../components/payment/StaffPaymentMethodPicker";
import {
  getStaffPaymentRedirect,
  isStaffOnlinePayment,
} from "../../../lib/staffPaymentUtils";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useMongoProfile from "../../../hooks/useMongoProfile";
import SmartLoader from "../../../components/SmartLoader";
import AddVehicleForm from "../../../components/AddVehicleForm";
import useTagTypes from "../../../hooks/useTagTypes";
import { isCycleTagType } from "../../../lib/tagTypeUtils";
import {
  createEmptyVehicleForm,
  buildVehicleAddPayload,
  validateVehicleForm,
} from "../../../lib/vehicleFormUtils";
import {
  cardSurface,
  dashboardBadge,
  dashboardPageHeader,
  dashboardPageSubtitle,
  dashboardPageTitle,
} from "../../../lib/uiClasses";

function normalizeList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  return [];
}

const AddVehiclePage = () => {
  const { user, userRole } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { data: mongoUser, isLoading: roleLoading } = useMongoProfile(
    Boolean(user?.email)
  );

  const [form, setForm] = useState(createEmptyVehicleForm);
  const { data: tagTypes = [] } = useTagTypes();

  const [assignableUsers, setAssignableUsers] = useState([]);
  const [assignableLoading, setAssignableLoading] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [createOrder, setCreateOrder] = useState(false);
  const [orderProducts, setOrderProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [products, setProducts] = useState([]);

  const role = userRole || mongoUser?.role || user?.role || "user";
  const isStaffAdd = role === "admin" || role === "provider";
  const profileId = mongoUser?._id || mongoUser?.id || user?._id;
  const isCycle = isCycleTagType(form.tagType, tagTypes);

  useEffect(() => {
    if (!isStaffAdd) return;
    let cancelled = false;
    (async () => {
      setAssignableLoading(true);
      try {
        const res = await axiosSecure.get("/api/users/assignable");
        if (!cancelled) setAssignableUsers(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setAssignableLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isStaffAdd, axiosSecure]);

  useEffect(() => {
    if (!isStaffAdd) return;
    axiosSecure
      .get("/api/products")
      .then((res) => setProducts(normalizeList(res.data)))
      .catch(console.error);
  }, [isStaffAdd, axiosSecure]);

  const orderTotal = useMemo(
    () =>
      orderProducts.reduce(
        (sum, row) =>
          sum + Number(row.product?.price || 0) * Math.max(1, Number(row.quantity) || 1),
        0
      ),
    [orderProducts]
  );

  const toggleProduct = (product) => {
    setOrderProducts((prev) => {
      const exists = prev.find((p) => p.product._id === product._id);
      if (exists) {
        return prev.filter((p) => p.product._id !== product._id);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const setProductQty = (productId, quantity) => {
    setOrderProducts((prev) =>
      prev.map((row) =>
        row.product._id === productId
          ? { ...row, quantity: Math.max(1, Number(quantity) || 1) }
          : row
      )
    );
  };

  const buildTagSlot = (vehicleId, productRow) => ({
    productId: String(productRow?.product?._id || productRow?.product?.id || ""),
    productTitle: productRow?.product?.title || form.model || "Vehicle",
    vehicleId,
    model: form.model,
    plate: isCycle
      ? form.plate
      : `${form.zone}-${form.series}-${form.regNumber}`,
    chassisLast4: form.chassisLast4,
    engineLast4: form.engineLast4,
    ownerPhone: form.ownerPhone,
    emergencyPhone: form.emergencyPhone,
    ownerContactVisible: form.ownerContactVisible,
    driverContactVisible: form.driverContactVisible,
    emergencyContactVisible: form.emergencyContactVisible,
    driver:
      form.addDriver && form.driverName && form.driverPhone
        ? { name: form.driverName, phone: form.driverPhone }
        : undefined,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateVehicleForm(form, isCycle);
    if (validationError) {
      alert(validationError);
      return;
    }

    if (!profileId) {
      alert("Could not load your profile. Please sign in again.");
      return;
    }

    if (isStaffAdd && !selectedOwnerId) {
      alert("Select the customer who owns this vehicle.");
      return;
    }

    if (createOrder && orderProducts.length === 0) {
      alert("Select at least one product for the order.");
      return;
    }

    if (createOrder && paymentMethod === "bkash_manual" && !transactionId.trim()) {
      alert("Enter bKash transaction ID for manual payment.");
      return;
    }

    setSubmitting(true);
    try {
      const vehiclePayload = {
        ...buildVehicleAddPayload(form, isCycle),
        owner: isStaffAdd ? selectedOwnerId : profileId,
      };

      const vehicleRes = await axiosSecure.post("/api/vehicle/add", vehiclePayload);
      const vehicle = vehicleRes.data?.data;
      const vehicleId = vehicle?._id;

      if (!createOrder || orderProducts.length === 0) {
        await queryClient.invalidateQueries({ queryKey: ["dashboard", "vehicles"] });
        alert("Vehicle added successfully.");
        setForm(createEmptyVehicleForm());
        setSelectedOwnerId("");
        setOrderProducts([]);
        setCreateOrder(false);
        return;
      }

      const primaryProduct = orderProducts[0];
      const orderPayload = {
        userId: selectedOwnerId,
        items: orderProducts.map((row) => ({
          productId: String(row.product._id),
          title: row.product.title,
          price: Number(row.product.price),
          quantity: Number(row.quantity) || 1,
          image: row.product.image || "",
        })),
        tagAssignments: vehicleId
          ? [buildTagSlot(vehicleId, primaryProduct)]
          : [],
        shippingAddress: {},
        totalAmount: orderTotal,
        paymentMethod,
        transactionId:
          paymentMethod === "bkash_manual" ? transactionId.trim() : undefined,
        note: orderNote.trim() || undefined,
      };

      const orderRes = await axiosSecure.post("/api/order/staff-create", orderPayload);

      const payUrl = getStaffPaymentRedirect(orderRes.data);
      if (isStaffOnlinePayment(paymentMethod) && payUrl) {
        window.location.href = payUrl;
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["dashboard", "vehicles"] });
      await queryClient.invalidateQueries({ queryKey: ["staff-orders"] });

      alert(
        `Vehicle and order #${orderRes.data?.orderNo || ""} created successfully.`
      );
      setForm(createEmptyVehicleForm());
      setSelectedOwnerId("");
      setOrderProducts([]);
      setCreateOrder(false);
      setTransactionId("");
      setOrderNote("");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (roleLoading && !userRole) {
    return <SmartLoader fullPage label="Checking permissions..." />;
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className={dashboardPageHeader}>
        <div className={dashboardBadge}>
          <Car className="h-3.5 w-3.5" />
          Fleet
        </div>
        <h1 className={dashboardPageTitle}>Add vehicle</h1>
        <p className={dashboardPageSubtitle}>
          {isStaffAdd
            ? "Register a customer vehicle and optionally create a paid order."
            : "Register your vehicle."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`space-y-4 p-6 ${cardSurface}`}>
        {isStaffAdd && (
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4">
            <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-900">
              <UserPlus className="h-3.5 w-3.5" />
              Vehicle owner (customer) *
            </label>
            <select
              className="select select-bordered mt-1 w-full rounded-xl border-slate-200 bg-white focus:border-emerald-500"
              value={selectedOwnerId}
              onChange={(e) => setSelectedOwnerId(e.target.value)}
              required
              disabled={submitting}
            >
              <option value="">Select customer user…</option>
              {assignableUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} — {u.email}
                </option>
              ))}
            </select>
            {assignableLoading && (
              <p className="mt-2 text-xs text-slate-500">Loading customers…</p>
            )}
          </div>
        )}

        <AddVehicleForm
          form={form}
          onPatch={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        />

        {isStaffAdd && (
          <>
            <button
              type="button"
              onClick={() => setCreateOrder((v) => !v)}
              className="btn btn-outline btn-sm w-full rounded-xl border-emerald-300 text-emerald-800"
            >
              {createOrder ? "− Remove order" : "+ Create order"}
            </button>

            {createOrder && (
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <ShoppingBag className="h-4 w-4" />
                  Products
                </h3>
                <ul className="max-h-48 space-y-2 overflow-y-auto">
                  {products.map((p) => {
                    const row = orderProducts.find((r) => r.product._id === p._id);
                    return (
                      <li
                        key={p._id}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(row)}
                          onChange={() => toggleProduct(p)}
                          className="checkbox checkbox-sm checkbox-primary"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{p.title}</p>
                          <p className="text-xs text-emerald-700">
                            ৳ {Number(p.price || 0).toLocaleString()}
                          </p>
                        </div>
                        {row && (
                          <input
                            type="number"
                            min={1}
                            value={row.quantity}
                            onChange={(e) => setProductQty(p._id, e.target.value)}
                            className="input input-bordered input-xs w-14"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
                <p className="text-right text-sm font-bold text-slate-900">
                  Total: ৳ {orderTotal.toLocaleString()}
                </p>

                <StaffPaymentMethodPicker
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  transactionId={transactionId}
                  onTransactionIdChange={setTransactionId}
                  orderNote={orderNote}
                  onOrderNoteChange={setOrderNote}
                  titleClassName="text-xs font-bold uppercase tracking-wide text-slate-600"
                />
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={submitting || (isStaffAdd && !selectedOwnerId)}
          className="btn btn-block gap-2 rounded-xl border-0 bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {submitting
            ? "Saving…"
            : createOrder && orderProducts.length > 0
              ? "Save vehicle & create order"
              : "Save vehicle"}
        </button>
      </form>
    </div>
  );
};

export default AddVehiclePage;
