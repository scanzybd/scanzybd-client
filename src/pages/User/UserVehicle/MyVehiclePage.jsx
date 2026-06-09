import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Car, Phone, UserRound, AlertCircle } from "lucide-react";
import Switch from "react-switch";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";
import { qrAssignmentLabel } from "../../../lib/vehicleQr";

const CONTACT_OFF_HEX = "#d1d9e3";
const CONTACT_ON_HEX = { green: "#059669", blue: "#2563eb", red: "#dc2626" };

const ContactToggle = ({ label, checked, onClick, disabled = false, tone = "green" }) => (
  <Switch
    checked={checked}
    onChange={() => !disabled && onClick()}
    disabled={disabled}
    onColor={CONTACT_ON_HEX[tone] ?? CONTACT_ON_HEX.green}
    offColor={CONTACT_OFF_HEX}
    onHandleColor="#f1f5f9"
    offHandleColor="#f1f5f9"
    uncheckedIcon={false}
    checkedIcon={false}
    height={26}
    width={52}
    borderRadius={13}
    handleDiameter={22}
    aria-label={label}
  />
);

const phoneDigits = (v) => String(v || "").replace(/\D/g, "").slice(0, 11);

const fieldClass =
  "input input-bordered w-full rounded-xl border-slate-200 bg-white text-sm dark:border-slate-600 dark:bg-slate-800";

function ContactRow({ icon: Icon, label, tone, vehicle, fieldKey, saving, onToggle }) {
  const isOn = Boolean(vehicle[fieldKey]);
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex shrink-0 items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <span
          className={`text-xs font-semibold tabular-nums ${
            isOn ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"
          }`}
          aria-hidden
        >
          {isOn ? "Visible" : "Hidden"}
        </span>
        <ContactToggle
          label={`${label} contact ${isOn ? "visible" : "hidden"} on QR scan`}
          checked={isOn}
          onClick={() => onToggle(vehicle, fieldKey)}
          disabled={Boolean(saving[`${vehicle._id}:${fieldKey}`])}
          tone={tone}
        />
      </div>
    </div>
  );
}

const MyVehiclePage = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [editVehicle, setEditVehicle] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const [toggleSaving, setToggleSaving] = useState({});
  const [inlineEditor, setInlineEditor] = useState({});
  const [uiError, setUiError] = useState("");

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axiosSecure.get("/api/auth/me");
        setMongoUser(res.data);
      } catch {
        /* profile load failed */
      } finally {
        setRoleLoading(false);
      }
    };
    getUser();
  }, [axiosSecure]);

  const role = mongoUser?.role;
  const isAdmin = role === "admin";

  const loadVehicles = useCallback(async () => {
    if (!user?.email) return;
    setLoadingVehicles(true);
    try {
      const res = await axiosSecure.get("/api/vehicle/my");
      const data = res.data.data || [];
      setVehicles(data);
    } catch {
      /* vehicle list load failed */
    } finally {
      setLoadingVehicles(false);
    }
  }, [user?.email, axiosSecure]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const openEdit = (v) => {
    setEditVehicle({
      _id: v._id,
      ownerPhone: v.ownerPhone || "",
      emergencyPhone: v.emergencyPhone || "",
      driverName: v.driver?.name || "",
      driverPhone: v.driver?.phone || "",
      vehicleName: v.vehicleName,
      plate: v.plate,
    });
  };

  const handleUpdate = async () => {
    if (!editVehicle?._id) return;

    const ownerPhone = phoneDigits(editVehicle.ownerPhone);
    const emergencyPhone = phoneDigits(editVehicle.emergencyPhone);
    const driverName = editVehicle.driverName?.trim() || "";
    const driverPhone = phoneDigits(editVehicle.driverPhone);

    if (ownerPhone && ownerPhone.length !== 11) {
      setUiError("Owner phone must be 11 digits.");
      return;
    }
    if (emergencyPhone && emergencyPhone.length !== 11) {
      setUiError("Emergency phone must be 11 digits.");
      return;
    }
    if ((driverName && !driverPhone) || (driverPhone && !driverName)) {
      setUiError("Driver name and phone both required, or leave both empty.");
      return;
    }
    if (driverPhone && driverPhone.length !== 11) {
      setUiError("Driver phone must be 11 digits.");
      return;
    }

    try {
      await axiosSecure.post(`/api/vehicle/update/${editVehicle._id}`, {
        ownerPhone,
        emergencyPhone,
        driver: driverName && driverPhone ? { name: driverName, phone: driverPhone } : null,
      });
      setEditVehicle(null);
      setUiError("");
      await loadVehicles();
    } catch (err) {
      setUiError(err?.response?.data?.message || "Update failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!id || !window.confirm("Delete this vehicle?")) return;
    try {
      await axiosSecure.delete(`/api/vehicle/delete/${id}`);
      await loadVehicles();
    } catch {
      /* delete failed */
    }
  };

  const handleToggleVisibility = async (vehicle, key) => {
    const needsOwner = key === "ownerContactVisible" && !String(vehicle.ownerPhone || "").trim();
    const needsEmergency =
      key === "emergencyContactVisible" && !String(vehicle.emergencyPhone || "").trim();
    const needsDriver =
      key === "driverContactVisible" &&
      (!vehicle?.driver?.name || !String(vehicle?.driver?.phone || "").trim());

    if (!vehicle?.[key] && (needsOwner || needsEmergency || needsDriver)) {
      setInlineEditor((prev) => ({
        ...prev,
        [vehicle._id]: {
          target: key,
          ownerPhone: vehicle?.ownerPhone || "",
          emergencyPhone: vehicle?.emergencyPhone || "",
          driverName: vehicle?.driver?.name || "",
          driverPhone: vehicle?.driver?.phone || "",
        },
      }));
      setUiError("Contact missing. Fill the field below and save.");
      return;
    }

    const pendingKey = `${vehicle._id}:${key}`;
    if (toggleSaving[pendingKey]) return;
    const previous = Boolean(vehicle?.[key]);
    const nextValue = !previous;

    setToggleSaving((prev) => ({ ...prev, [pendingKey]: true }));
    setVehicles((prev) =>
      prev.map((v) => (v._id === vehicle._id ? { ...v, [key]: nextValue } : v))
    );

    try {
      await axiosSecure.post(`/api/vehicle/update/${vehicle._id}`, { [key]: nextValue });
      setUiError("");
    } catch (err) {
      setVehicles((prev) =>
        prev.map((v) => (v._id === vehicle._id ? { ...v, [key]: previous } : v))
      );
      setUiError(err?.response?.data?.message || "Visibility update failed.");
    } finally {
      setToggleSaving((prev) => ({ ...prev, [pendingKey]: false }));
    }
  };

  const closeInlineEditor = (vehicleId) => {
    setInlineEditor((prev) => {
      const next = { ...prev };
      delete next[vehicleId];
      return next;
    });
  };

  const saveInlineContact = async (vehicle) => {
    const row = inlineEditor[vehicle._id];
    if (!row) return;

    const payload = {};
    if (row.target === "ownerContactVisible") {
      const p = phoneDigits(row.ownerPhone);
      if (p.length !== 11) {
        setUiError("Owner phone must be 11 digits.");
        return;
      }
      payload.ownerPhone = p;
    }
    if (row.target === "emergencyContactVisible") {
      const p = phoneDigits(row.emergencyPhone);
      if (p.length !== 11) {
        setUiError("Emergency phone must be 11 digits.");
        return;
      }
      payload.emergencyPhone = p;
    }
    if (row.target === "driverContactVisible") {
      if (!row.driverName?.trim() || phoneDigits(row.driverPhone).length !== 11) {
        setUiError("Driver name and 11-digit phone required.");
        return;
      }
      payload.driver = { name: row.driverName.trim(), phone: phoneDigits(row.driverPhone) };
    }

    try {
      await axiosSecure.post(`/api/vehicle/update/${vehicle._id}`, payload);
      await loadVehicles();
      closeInlineEditor(vehicle._id);
      setUiError("");
    } catch (err) {
      setUiError(err?.response?.data?.message || "Contact save failed.");
    }
  };

  const vehicleCountLabel = useMemo(
    () => `${vehicles.length} vehicle${vehicles.length === 1 ? "" : "s"}`,
    [vehicles.length]
  );

  if (roleLoading) {
    return <SmartLoader fullPage label="Loading your account..." />;
  }

  const renderInlineEditor = (v) => {
    const row = inlineEditor[v._id];
    if (!row) return null;
    return (
      <div className="mt-3 space-y-2 rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
        <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
          Add contact to turn visibility ON
        </p>
        {row.target === "ownerContactVisible" && (
          <input
            className={fieldClass}
            placeholder="Owner phone (11 digits)"
            value={row.ownerPhone}
            onChange={(e) =>
              setInlineEditor((prev) => ({
                ...prev,
                [v._id]: { ...prev[v._id], ownerPhone: phoneDigits(e.target.value) },
              }))
            }
          />
        )}
        {row.target === "emergencyContactVisible" && (
          <input
            className={fieldClass}
            placeholder="Emergency phone (11 digits)"
            value={row.emergencyPhone}
            onChange={(e) =>
              setInlineEditor((prev) => ({
                ...prev,
                [v._id]: { ...prev[v._id], emergencyPhone: phoneDigits(e.target.value) },
              }))
            }
          />
        )}
        {row.target === "driverContactVisible" && (
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className={fieldClass}
              placeholder="Driver name"
              value={row.driverName}
              onChange={(e) =>
                setInlineEditor((prev) => ({
                  ...prev,
                  [v._id]: { ...prev[v._id], driverName: e.target.value },
                }))
              }
            />
            <input
              className={fieldClass}
              placeholder="Driver phone (11 digits)"
              value={row.driverPhone}
              onChange={(e) =>
                setInlineEditor((prev) => ({
                  ...prev,
                  [v._id]: { ...prev[v._id], driverPhone: phoneDigits(e.target.value) },
                }))
              }
            />
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => saveInlineContact(v)}
            className="btn btn-primary btn-sm rounded-lg"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => closeInlineEditor(v._id)}
            className="btn btn-ghost btn-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderVehicleCard = (v) => {
    return (
      <article
        key={v._id}
        className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        {/* ——— Mobile header ——— */}
        <div className="border-b border-slate-100 p-4 lg:hidden dark:border-slate-800">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
              {v.vehicleName}
            </h2>
            <p className="mt-0.5 font-mono text-sm text-emerald-700 dark:text-emerald-400">
              {v.plate}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {v.model} · {qrAssignmentLabel(v)}
            </p>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => openEdit(v)}
              className="btn btn-primary btn-sm flex-1 gap-1 rounded-xl"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit contacts
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleDelete(v._id)}
                className="btn btn-outline btn-error btn-sm rounded-xl"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ——— Desktop header ——— */}
        <div className="hidden border-b border-slate-100 px-6 py-4 lg:flex lg:items-center lg:justify-between dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{v.vehicleName}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {v.model} ·{" "}
                <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">
                  {v.plate}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">{qrAssignmentLabel(v)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => openEdit(v)}
                className="btn btn-primary btn-sm gap-2 rounded-xl"
              >
                <Pencil className="h-4 w-4" />
                Edit contacts
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleDelete(v._id)}
                  className="btn btn-outline btn-error btn-sm gap-2 rounded-xl"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ——— Contact phones (read-only display) ——— */}
        <div className="space-y-2 p-4 lg:grid lg:grid-cols-2 lg:gap-3 lg:p-6">
          {v.ownerPhone ? (
            <p className="flex items-center gap-2 text-sm text-slate-600 lg:col-span-2 dark:text-slate-300">
              <Phone className="h-4 w-4 text-emerald-600" />
              Owner: <span className="font-mono font-medium">{v.ownerPhone}</span>
            </p>
          ) : null}
          {v.emergencyPhone ? (
            <p className="flex items-center gap-2 text-sm text-slate-600 lg:col-span-2 dark:text-slate-300">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Emergency: <span className="font-mono font-medium">{v.emergencyPhone}</span>
            </p>
          ) : null}
          {v.driver?.name || v.driver?.phone ? (
            <p className="flex items-center gap-2 text-sm text-slate-600 lg:col-span-2 dark:text-slate-300">
              <UserRound className="h-4 w-4 text-blue-600" />
              Driver: {v.driver.name}{" "}
              {v.driver.phone ? (
                <span className="font-mono">({v.driver.phone})</span>
              ) : null}
            </p>
          ) : null}
        </div>

        {/* ——— Visibility toggles ——— */}
        <div className="space-y-2 border-t border-slate-100 px-4 py-4 lg:px-6 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Public visibility (QR scan)
          </p>
          <div className="space-y-2">
            <ContactRow
              icon={Phone}
              label="Owner"
              tone="green"
              vehicle={v}
              fieldKey="ownerContactVisible"
              saving={toggleSaving}
              onToggle={handleToggleVisibility}
            />
            <ContactRow
              icon={UserRound}
              label="Driver"
              tone="blue"
              vehicle={v}
              fieldKey="driverContactVisible"
              saving={toggleSaving}
              onToggle={handleToggleVisibility}
            />
            <ContactRow
              icon={AlertCircle}
              label="Emergency"
              tone="red"
              vehicle={v}
              fieldKey="emergencyContactVisible"
              saving={toggleSaving}
              onToggle={handleToggleVisibility}
            />
          </div>
          {renderInlineEditor(v)}
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10 dark:bg-slate-950">
      {/* Mobile page shell */}
      <div className="mx-auto w-full max-w-lg px-4 pt-5 lg:hidden">
        {uiError ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {uiError}
          </div>
        ) : null}
        <header className="mb-5 text-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Vehicles</h1>
          <p className="mt-1 text-xs text-slate-500">{user?.email}</p>
          <p className="mt-2 text-sm font-medium text-emerald-700">{vehicleCountLabel}</p>
        </header>
        {loadingVehicles ? (
          <SmartLoader label="Loading vehicles..." />
        ) : vehicles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            <Car className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-700 dark:text-slate-300">No vehicles yet</p>
            <p className="mt-2 text-xs leading-relaxed">
              Vehicles appear here after you purchase a QR tag and complete checkout.
            </p>
            <Link to="/Products" className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">{vehicles.map(renderVehicleCard)}</div>
        )}
      </div>

      {/* Desktop page shell */}
      <div className="mx-auto hidden w-full max-w-5xl px-6 py-8 lg:block">
        {uiError ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {uiError}
          </div>
        ) : null}
        <header className="mb-8 flex items-end justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Your fleet
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">My Vehicles</h1>
            <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{vehicles.length}</p>
            <p className="text-xs text-slate-500">registered</p>
          </div>
        </header>
        {loadingVehicles ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <SmartLoader label="Loading vehicles..." />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <Car className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">No vehicles yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Vehicles appear here after you purchase a QR tag and complete checkout.
            </p>
            <Link to="/Products" className="btn btn-primary btn-sm mt-6 rounded-xl">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">{vehicles.map(renderVehicleCard)}</div>
        )}
      </div>

      {/* Edit modal — contacts only */}
      {editVehicle && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={() => setEditVehicle(null)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit contacts</h2>
            <p className="mt-1 text-sm text-slate-500">
              {editVehicle.vehicleName} · {editVehicle.plate}
            </p>

            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Owner phone
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  className={`${fieldClass} mt-1`}
                  placeholder="01XXXXXXXXX"
                  value={editVehicle.ownerPhone}
                  onChange={(e) =>
                    setEditVehicle((prev) => ({
                      ...prev,
                      ownerPhone: phoneDigits(e.target.value),
                    }))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Emergency phone
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  className={`${fieldClass} mt-1`}
                  placeholder="01XXXXXXXXX"
                  value={editVehicle.emergencyPhone}
                  onChange={(e) =>
                    setEditVehicle((prev) => ({
                      ...prev,
                      emergencyPhone: phoneDigits(e.target.value),
                    }))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Driver name
                </span>
                <input
                  className={`${fieldClass} mt-1`}
                  placeholder="Optional"
                  value={editVehicle.driverName}
                  onChange={(e) =>
                    setEditVehicle((prev) => ({ ...prev, driverName: e.target.value }))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Driver phone
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  className={`${fieldClass} mt-1`}
                  placeholder="01XXXXXXXXX"
                  value={editVehicle.driverPhone}
                  onChange={(e) =>
                    setEditVehicle((prev) => ({
                      ...prev,
                      driverPhone: phoneDigits(e.target.value),
                    }))
                  }
                />
              </label>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={handleUpdate}
                className="btn btn-primary flex-1 rounded-xl"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditVehicle(null)}
                className="btn btn-ghost flex-1 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVehiclePage;
