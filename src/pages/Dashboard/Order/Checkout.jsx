import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Copy, MapPin } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useCart from "../../../hooks/useCart";
import { getAppJwtIfValid } from "../../../utils/appJwtStorage";
import {
  shellPage,
  cardSurface,
  fieldInput,
  btnPrimary,
  btnSecondary,
  textMuted,
  textHeading,
} from "../../../lib/uiClasses";

const emptyVehicleForm = () => ({
  vehicleName: "",
  model: "",
  plate: "",
  ownerPhone: "",
  ownerContactVisible: true,
  emergencyPhone: "",
  emergencyContactVisible: false,
  driverContactVisible: false,
  addDriver: false,
  driverName: "",
  driverPhone: "",
});

const STEPS = [
  { n: 1, label: "Order" },
  { n: 2, label: "Address" },
  { n: 3, label: "Vehicles" },
];

const Checkout = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const { cartItems } = useCart();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    division: "",
    district: "",
    upazila: "",
    union: "",
  });
  const [locationTree, setLocationTree] = useState({
    divisions: [],
    districts: {},
    upazilas: {},
  });

  /** One checkout row per physical tag (quantity expanded). */
  const slots = useMemo(() => {
    const out = [];
    for (const item of cartItems) {
      const q = Math.max(1, Number(item.quantity) || 1);
      for (let i = 0; i < q; i++) {
        out.push({
          key: `${item._id}__${i}`,
          productId: String(item._id),
          title: item.title || item.name || "Product",
        });
      }
    }
    return out;
  }, [cartItems]);

  useEffect(() => {
    setVehicles(slots.map(() => emptyVehicleForm()));
  }, [slots]);

  useEffect(() => {
    if (cartItems.length === 0) setStep(1);
  }, [cartItems.length]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    let active = true;
    const loadLocations = async () => {
      try {
        const res = await axiosSecure.get("/api/locations");
        if (!active) return;
        setLocationTree({
          divisions: Array.isArray(res?.data?.divisions) ? res.data.divisions : [],
          districts: res?.data?.districts || {},
          upazilas: res?.data?.upazilas || {},
        });
      } catch (error) {
        console.error("Failed to load locations", error);
      }
    };
    loadLocations();
    return () => {
      active = false;
    };
  }, [axiosSecure]);

  const total = useMemo(() => {
    return cartItems.reduce(
      (sum, item) =>
        sum + Number(item.price) * Math.max(1, Number(item.quantity) || 1),
      0
    );
  }, [cartItems]);

  const updateVehicle = useCallback((index, patch) => {
    setVehicles((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  }, []);

  const copyFromPrevious = (index) => {
    if (index === 0) return;
    setVehicles((prev) => {
      const src = prev[index - 1];
      const next = [...prev];
      next[index] = {
        vehicleName: src.vehicleName,
        model: src.model,
        plate: src.plate,
        ownerPhone: src.ownerPhone,
        ownerContactVisible: src.ownerContactVisible,
        emergencyPhone: src.emergencyPhone,
        emergencyContactVisible: src.emergencyContactVisible,
        driverContactVisible: src.driverContactVisible,
        addDriver: src.addDriver,
        driverName: src.driverName,
        driverPhone: src.driverPhone,
      };
      return next;
    });
  };

  const validateShipping = () => {
    if (
      !shipping.fullName?.trim() ||
      !shipping.phone?.trim() ||
      !shipping.division ||
      !shipping.district ||
      !shipping.upazila ||
      !shipping.union?.trim()
    ) {
      alert(
        "Fill delivery details: full name, phone, division, district, upazila, and union."
      );
      return false;
    }
    if (!/^\d{11}$/.test(shipping.phone.trim())) {
      alert("Delivery address phone must be exactly 11 digits.");
      return false;
    }
    return true;
  };
  const divisionOptions = useMemo(
    () => (Array.isArray(locationTree.divisions) ? locationTree.divisions : []),
    [locationTree.divisions]
  );
  const districtOptions = useMemo(
    () => locationTree.districts?.[shipping.division] || [],
    [locationTree.districts, shipping.division]
  );
  const upazilaOptions = useMemo(
    () => locationTree.upazilas?.[shipping.district] || [],
    [locationTree.upazilas, shipping.district]
  );
  const selectedDivision = useMemo(
    () => divisionOptions.find((x) => String(x.value) === String(shipping.division)),
    [divisionOptions, shipping.division]
  );
  const selectedDistrict = useMemo(
    () => districtOptions.find((x) => String(x.value) === String(shipping.district)),
    [districtOptions, shipping.district]
  );
  const selectedUpazila = useMemo(
    () => upazilaOptions.find((x) => String(x.value) === String(shipping.upazila)),
    [upazilaOptions, shipping.upazila]
  );
  const validateVehicles = () => {
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (!v.vehicleName?.trim() || !v.model?.trim() || !v.plate?.trim()) {
        alert(`Tag ${i + 1}: add vehicle name, model, and plate.`);
        return false;
      }
      if (!v.ownerPhone?.trim()) {
        alert(`Tag ${i + 1}: add owner phone.`);
        return false;
      }
      if (!v.emergencyPhone?.trim()) {
        alert(`Tag ${i + 1}: add emergency contact phone.`);
        return false;
      }
      if (!/^\d{11}$/.test(v.emergencyPhone.trim())) {
        alert(`Tag ${i + 1}: emergency contact phone must be 11 digits.`);
        return false;
      }
      if (v.addDriver) {
        if (!v.driverName?.trim() || !v.driverPhone?.trim()) {
          alert(`Tag ${i + 1}: add driver name and phone, or turn off driver.`);
          return false;
        }
      }
    }
    return true;
  };

  const goToAddress = () => {
    if (cartItems.length === 0) return;
    setStep(2);
  };

  const goToVehicles = () => {
    if (!validateShipping()) return;
    setStep(3);
  };

  const handlePayment = async () => {
    if (loading) return;

    if (!user?.email) {
      alert("Please login first");
      return;
    }

    if (cartItems.length === 0 || slots.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (vehicles.length !== slots.length) {
      alert("Please wait — loading vehicle forms.");
      return;
    }

    if (!validateShipping() || !validateVehicles()) return;

    setLoading(true);

    try {
      const token = getAppJwtIfValid();
      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      const tagAssignments = slots.map((slot, i) => {
        const v = vehicles[i];
        const driver =
          v.addDriver && v.driverName?.trim() && v.driverPhone?.trim()
            ? {
                name: v.driverName.trim(),
                phone: v.driverPhone.trim(),
              }
            : undefined;

        return {
          productId: slot.productId,
          productTitle: slot.title,
          vehicleName: v.vehicleName.trim(),
          model: v.model.trim(),
          plate: v.plate.trim(),
          ownerPhone: v.ownerPhone.trim(),
          ownerContactVisible: Boolean(v.ownerContactVisible),
          emergencyPhone: v.emergencyPhone.trim(),
          emergencyContactVisible: Boolean(v.emergencyContactVisible),
          driverContactVisible: Boolean(v.driverContactVisible),
          ...(driver ? { driver } : {}),
        };
      });

      const orderRes = await axiosSecure.post(
        "/api/order/create",
        {
          cartItems,
          amount: total,
          tagAssignments,
          shippingAddress: {
            fullName: shipping.fullName.trim(),
            phone: shipping.phone.trim(),
            line1:
              shipping.addressLine.trim() ||
              `${shipping.union.trim()}, ${selectedUpazila?.title || ""}`
                .replace(/^,\s*|,\s*$/g, "")
                .trim(),
            line2: "",
            city: (selectedDistrict?.title || "").trim(),
            district: (selectedDivision?.title || "").trim(),
            postalCode: "",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orderId = orderRes?.data?.orderId;

      if (!orderId) throw new Error("Order failed");

      const paymentRes = await axiosSecure.post(
        "/api/payment/create",
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = paymentRes?.data?.bkashURL;

      if (!url) throw new Error("Payment failed");

      localStorage.setItem("pendingOrderId", orderId);

      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const totalTags = slots.length;

  const compactSummary =
    cartItems.length > 0 ? (
      <div className="rounded-xl border border-slate-200 bg-slate-100/90 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`font-medium ${textHeading}`}>
            {cartItems.reduce((n, i) => n + Math.max(1, Number(i.quantity) || 1), 0)}{" "}
            tag
            {totalTags !== 1 ? "s" : ""}
          </span>
          <span className="font-bold tabular-nums text-amber-700 dark:text-amber-400">
            ৳ {total}
          </span>
        </div>
      </div>
    ) : null;

  return (
    <div
      className={`flex min-h-screen justify-center p-4 pb-12 sm:p-6 ${shellPage}`}
    >
      <div className="w-full max-w-3xl space-y-6">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${textHeading}`}>
            Checkout
          </h1>
          <p className={`mt-1 text-sm ${textMuted}`}>
            {step === 1 && "Review your order, then add delivery address."}
            {step === 2 && "Where should we send your QR tags?"}
            {step === 3 &&
              "Vehicle details for each tag. Driver is optional."}
          </p>
        </div>

        {/* Step indicator */}
        {cartItems.length > 0 && (
          <nav
            className="flex flex-wrap items-center gap-2 text-xs font-semibold sm:text-sm"
            aria-label="Checkout steps"
          >
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.n}>
                {idx > 0 && (
                  <span className="text-slate-400 dark:text-slate-600" aria-hidden>
                    →
                  </span>
                )}
                <span
                  className={
                    step === s.n
                      ? "rounded-full bg-amber-600 px-3 py-1 text-white dark:bg-amber-500 dark:text-slate-950"
                      : step > s.n
                        ? "text-emerald-600 dark:text-emerald-400"
                        : `${textMuted} opacity-80`
                  }
                >
                  {s.n}. {s.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Step 1: Cart summary only */}
        {step === 1 && (
          <>
            <div className={`p-5 ${cardSurface}`}>
              <h2 className={`mb-4 text-lg font-bold ${textHeading}`}>Your order</h2>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center">
                  <p className={textMuted}>Your cart is empty</p>
                  <Link
                    to="/Products"
                    className="mt-3 inline-block font-semibold text-amber-600 underline dark:text-amber-400"
                  >
                    Continue shopping
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {cartItems.map((item) => (
                    <li
                      key={item._id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700"
                    >
                      <span className={`font-medium ${textHeading}`}>
                        {item.title || item.name}
                      </span>
                      <span className={`text-sm ${textMuted}`}>
                        ×{item.quantity} · ৳{" "}
                        {Number(item.price) *
                          Math.max(1, Number(item.quantity) || 1)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
                <span className={`text-lg font-semibold ${textHeading}`}>Total</span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  ৳ {total}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={goToAddress}
              disabled={cartItems.length === 0}
              className={
                cartItems.length === 0
                  ? `${btnPrimary} cursor-not-allowed opacity-50`
                  : btnPrimary
              }
            >
              Continue to delivery address
            </button>
          </>
        )}

        {/* Step 2: Delivery address */}
        {step === 2 && cartItems.length > 0 && (
          <>
            {compactSummary}
            <div className={`p-5 ${cardSurface}`}>
              <h2 className={`mb-1 flex items-center gap-2 text-lg font-bold ${textHeading}`}>
                <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden />
                Delivery address
              </h2>
              <p className={`mb-4 text-xs ${textMuted}`}>
                Where we&apos;ll send your QR tags.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                    Full name
                  </span>
                  <input
                    className={fieldInput}
                    value={shipping.fullName}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, fullName: e.target.value }))
                    }
                    placeholder="Recipient name"
                    autoComplete="name"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                    Phone (for delivery)
                  </span>
                  <input
                    className={fieldInput}
                    value={shipping.phone}
                    onChange={(e) =>
                      setShipping((s) => ({
                        ...s,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 11),
                      }))
                    }
                    placeholder="01XXXXXXXXX"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={11}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                    Address line (optional)
                  </span>
                  <input
                    className={fieldInput}
                    value={shipping.addressLine}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, addressLine: e.target.value }))
                    }
                    placeholder="House / Road / Area"
                    autoComplete="street-address"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                    Division
                  </span>
                  <select
                    className={fieldInput}
                    value={shipping.division}
                    onChange={(e) =>
                      setShipping((s) => ({
                        ...s,
                        division: e.target.value,
                        district: "",
                        upazila: "",
                        union: "",
                      }))
                    }
                  >
                    <option value="">Select division</option>
                    {divisionOptions.map((division) => (
                      <option key={division.value} value={division.value}>
                        {division.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                    District
                  </span>
                  <select
                    className={fieldInput}
                    value={shipping.district}
                    onChange={(e) =>
                      setShipping((s) => ({
                        ...s,
                        district: e.target.value,
                        upazila: "",
                        union: "",
                      }))
                    }
                    disabled={!shipping.division}
                  >
                    <option value="">Select district</option>
                    {districtOptions.map((district) => (
                      <option key={district.value} value={district.value}>
                        {district.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                    Upazila
                  </span>
                  <select
                    className={fieldInput}
                    value={shipping.upazila}
                    onChange={(e) =>
                      setShipping((s) => ({
                        ...s,
                        upazila: e.target.value,
                        union: "",
                      }))
                    }
                    disabled={!shipping.district}
                  >
                    <option value="">Select upazila</option>
                    {upazilaOptions.map((upazila) => (
                      <option key={upazila.value} value={upazila.value}>
                        {upazila.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                    Union / ward
                  </span>
                  <input
                    type="text"
                    className={fieldInput}
                    value={shipping.union}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, union: e.target.value }))
                    }
                    disabled={!shipping.upazila}
                    placeholder="Type union or ward name"
                    autoComplete="address-level4"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={goToVehicles}
                className={`${btnPrimary} sm:flex-1`}
              >
                Continue to vehicle details
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`${btnSecondary} sm:flex-1`}
              >
                Back
              </button>
            </div>
          </>
        )}

        {/* Step 3: Vehicles + pay */}
        {step === 3 && cartItems.length > 0 && totalTags > 0 && (
          <>
            {compactSummary}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className={`text-lg font-bold ${textHeading}`}>
                  Vehicle for each tag
                </h2>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-700 dark:text-slate-100">
                  {totalTags} tag{totalTags !== 1 ? "s" : ""}
                </span>
              </div>

              {slots.map((slot, index) => {
                const v = vehicles[index] || emptyVehicleForm();
                return (
                  <div key={slot.key} className={`p-5 ${cardSurface}`}>
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                          Tag {index + 1} of {totalTags}
                        </p>
                        <p className={`font-semibold ${textHeading}`}>{slot.title}</p>
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => copyFromPrevious(index)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Same as previous
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                          Vehicle name
                        </span>
                        <input
                          className={fieldInput}
                          value={v.vehicleName}
                          onChange={(e) =>
                            updateVehicle(index, { vehicleName: e.target.value })
                          }
                          placeholder="e.g. Toyota Axio"
                        />
                      </label>
                      <label className="block">
                        <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                          Model
                        </span>
                        <input
                          className={fieldInput}
                          value={v.model}
                          onChange={(e) =>
                            updateVehicle(index, { model: e.target.value })
                          }
                          placeholder="Year / variant"
                        />
                      </label>
                      <label className="block">
                        <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                          Registration No (Number Plate)
                        </span>
                        <input
                          className={`${fieldInput} font-mono`}
                          value={v.plate}
                          onChange={(e) =>
                            updateVehicle(index, { plate: e.target.value })
                          }
                          placeholder="Dhaka Metro 00-0000"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                          Owner phone
                        </span>
                        <input
                          className={fieldInput}
                          value={v.ownerPhone}
                          onChange={(e) =>
                            updateVehicle(index, { ownerPhone: e.target.value })
                          }
                          placeholder="01XXXXXXXXX"
                          inputMode="tel"
                          maxLength={11}
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                          Emergency contact phone
                        </span>
                        <input
                          className={fieldInput}
                          value={v.emergencyPhone}
                          onChange={(e) =>
                            updateVehicle(index, {
                              emergencyPhone: e.target.value.replace(/\D/g, "").slice(0, 11),
                            })
                          }
                          placeholder="01XXXXXXXXX"
                          inputMode="tel"
                          maxLength={11}
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                          Owner contact permission
                        </span>
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={Boolean(v.ownerContactVisible)}
                            onChange={(e) =>
                              updateVehicle(index, {
                                ownerContactVisible: e.target.checked,
                              })
                            }
                          />
                          Show owner contact on public QR page
                        </label>
                      </label>
                      <label className="block sm:col-span-2">
                        <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                          Emergency contact permission
                        </span>
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={Boolean(v.emergencyContactVisible)}
                            onChange={(e) =>
                              updateVehicle(index, {
                                emergencyContactVisible: e.target.checked,
                              })
                            }
                          />
                          Allow public QR page to show emergency contact
                        </label>
                      </label>
                      <label className="block sm:col-span-2">
                        <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                          Driver contact permission
                        </span>
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={Boolean(v.driverContactVisible)}
                            onChange={(e) =>
                              updateVehicle(index, {
                                driverContactVisible: e.target.checked,
                              })
                            }
                          />
                          Show driver contact on public QR page
                        </label>
                      </label>
                    </div>

                    <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() =>
                          updateVehicle(index, { addDriver: !v.addDriver })
                        }
                        className={`flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/80 dark:hover:bg-slate-800 ${textHeading}`}
                      >
                        <span>Driver (optional)</span>
                        {v.addDriver ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {v.addDriver && (
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <input
                            className={fieldInput}
                            placeholder="Driver name"
                            value={v.driverName}
                            onChange={(e) =>
                              updateVehicle(index, {
                                driverName: e.target.value,
                              })
                            }
                          />
                          <input
                            className={fieldInput}
                            placeholder="Driver phone"
                            value={v.driverPhone}
                            onChange={(e) =>
                              updateVehicle(index, {
                                driverPhone: e.target.value,
                              })
                            }
                            inputMode="tel"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={handlePayment}
                disabled={loading}
                className={`${btnPrimary} sm:flex-1 ${loading ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {loading ? "Processing..." : "Pay with bKash"}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className={`${btnSecondary} sm:flex-1 disabled:opacity-50`}
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
