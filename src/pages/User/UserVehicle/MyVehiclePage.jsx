import React, { useCallback, useEffect, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";
import {
  shellPage,
  cardSurfaceSm,
  fieldInput,
  btnPrimaryInline,
  btnSecondaryInline,
  textHeading,
  textMuted,
} from "../../../lib/uiClasses";
import { Pencil, Trash2 } from "lucide-react";
import Switch from "react-switch";

/** Solid hex for react-switch (tailwind slate-200 → slate-300 track) */
const CONTACT_OFF_HEX = "#d1d9e3";

const CONTACT_ON_HEX = {
  green: "#059669",
  blue: "#2563eb",
  red: "#dc2626",
};

const switchIconBase =
  "flex h-full w-full items-center text-[8px] font-bold uppercase tracking-wide text-white";

const ContactToggle = ({ label, checked, onClick, disabled = false, tone = "green" }) => {
  const onHex = CONTACT_ON_HEX[tone] ?? CONTACT_ON_HEX.green;

  return (
    <Switch
      checked={checked}
      onChange={() => {
        if (!disabled) onClick();
      }}
      disabled={disabled}
      onColor={onHex}
      offColor={CONTACT_OFF_HEX}
      onHandleColor="#f1f5f9"
      offHandleColor="#f1f5f9"
      height={20}
      width={44}
      borderRadius={10}
      handleDiameter={16}
      uncheckedIcon={
        <div className={`${switchIconBase} justify-end pr-1`}>
          OFF
        </div>
      }
      checkedIcon={
        <div className={`${switchIconBase} justify-start pl-1`}>
          ON
        </div>
      }
      boxShadow="0 1px 2px rgba(15, 23, 42, 0.12)"
      activeBoxShadow="0 0 0 2px rgba(59, 130, 246, 0.35)"
      className={`shrink-0 align-middle ${disabled ? "opacity-60" : ""}`}
      aria-label={label}
      title={`${label} ${checked ? "ON" : "OFF"}`}
    />
  );
};

const MyVehiclePage = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [viewVehicle, setViewVehicle] = useState(null);
  const [editVehicle, setEditVehicle] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [qrMap, setQrMap] = useState({});
  const [toggleSaving, setToggleSaving] = useState({});
  const [inlineEditor, setInlineEditor] = useState({});
  const [uiError, setUiError] = useState("");

  // ---------------- LOAD USER ----------------
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axiosSecure.get("/api/auth/me");
        setMongoUser(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setRoleLoading(false);
      }
    };

    getUser();
  }, [axiosSecure]);

  const role = mongoUser?.role;

  // ---------------- LOAD VEHICLES ----------------
  const loadVehicles = useCallback(async () => {
    if (!user?.email) return;

    try {
      const res = await axiosSecure.get("/api/vehicle/my");

      const data = res.data.data || [];
      setVehicles(data);

      // ---------------- QR FETCH ----------------
      const qrIds = [...new Set(data.filter(v => v.qrData).map(v => v.qrData))];

      const qrResults = await Promise.all(
        qrIds.map(async (id) => {
          try {
            const res = await axiosSecure.get(`/api/qr/id/${id}`);
            return res.data;
          } catch {
            return null;
          }
        })
      );

      const map = {};
      qrResults.forEach((qr) => {
        if (qr?._id) map[qr._id] = qr;
      });

      setQrMap(map);
    } catch (err) {
      console.log(err);
    }
  }, [user, axiosSecure]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // ---------------- UPDATE ----------------
  const handleUpdate = async () => {
    try {
      const payload = {
        vehicleName: editVehicle.vehicleName,
        model: editVehicle.model,
        plate: editVehicle.plate,
        ownerPhone: editVehicle.ownerPhone,
        emergencyPhone: editVehicle.emergencyPhone,
        qrData: editVehicle.qrData,
      };

      const driverName = editVehicle?.driver?.name?.trim?.() || "";
      const driverPhone = editVehicle?.driver?.phone?.trim?.() || "";
      payload.driver =
        driverName && driverPhone
          ? { name: driverName, phone: driverPhone }
          : null;

      await axiosSecure.post(`/api/vehicle/update/${editVehicle._id}`, {
        ...payload,
      });

      alert("✅ Vehicle updated");
      setEditVehicle(null);
      loadVehicles();
    } catch (err) {
      console.log(err);
      alert("❌ Update failed");
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (!id) return;

    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    try {
      await axiosSecure.delete(`/api/vehicle/delete/${id}`);
      loadVehicles();
    } catch (err) {
      console.log(err);
    }
  };

  const handleToggleVisibility = async (vehicle, key) => {
    const needsOwner = key === "ownerContactVisible" && !String(vehicle.ownerPhone || "").trim();
    const needsEmergency = key === "emergencyContactVisible" && !String(vehicle.emergencyPhone || "").trim();
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
      setUiError("Contact missing. নিচে field fill করে Save দিন।");
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
      await axiosSecure.post(`/api/vehicle/update/${vehicle._id}`, {
        [key]: nextValue,
      });
    } catch (err) {
      console.log(err);
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
      if (!/^\d{11}$/.test(String(row.ownerPhone || ""))) {
        setUiError("Owner phone must be 11 digits.");
        return;
      }
      payload.ownerPhone = row.ownerPhone;
    }
    if (row.target === "emergencyContactVisible") {
      if (!/^\d{11}$/.test(String(row.emergencyPhone || ""))) {
        setUiError("Emergency phone must be 11 digits.");
        return;
      }
      payload.emergencyPhone = row.emergencyPhone;
    }
    if (row.target === "driverContactVisible") {
      if (!row.driverName?.trim() || !/^\d{11}$/.test(String(row.driverPhone || ""))) {
        setUiError("Driver name and 11-digit driver phone required.");
        return;
      }
      payload.driver = { name: row.driverName.trim(), phone: row.driverPhone };
    }

    try {
      await axiosSecure.post(`/api/vehicle/update/${vehicle._id}`, payload);
      await loadVehicles();
      closeInlineEditor(vehicle._id);
      setUiError("");
    } catch (err) {
      console.log(err);
      setUiError(err?.response?.data?.message || "Contact save failed.");
    }
  };

  if (roleLoading) {
    return <SmartLoader fullPage label="Checking role permissions..." />;
  }

  return (
    <div className={`flex min-h-screen justify-center p-5 ${shellPage}`}>
      <div className="w-full max-w-md space-y-4">
        {uiError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {uiError}
          </div>
        ) : null}

        {/* HEADER */}
        <div className="text-center">
          <h1 className={`text-xl font-bold tracking-tight ${textHeading}`}>
            My Vehicles
          </h1>
          <p className={`text-xs ${textMuted}`}>{user?.email}</p>
        </div>

        {/* LIST */}
        {vehicles.length === 0 ? (
          <div className={`p-5 text-center shadow-sm ${cardSurfaceSm} ${textMuted}`}>
            No vehicles yet
          </div>
        ) : (
          vehicles.map((v) => {
            const qr = qrMap[v.qrData];

            return (
              <div
                key={v._id}
                className={`flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between ${cardSurfaceSm}`}
              >

                {/* LEFT SIDE */}
                <div className="flex-1 space-y-1">
                  <p className={`font-bold ${textHeading}`}>{v.vehicleName}</p>

                  <p className={`text-xs ${textMuted}`}>
                    {v.model} • {v.plate}
                  </p>

                  {v.driver ? (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {v.driver.name} ({v.driver.phone})
                    </p>
                  ) : (
                    <p className={`text-xs ${textMuted}`}>No driver assigned</p>
                  )}

                  <p className={`text-xs ${textMuted}`}>
                    QR:{" "}
                    <span className={v.qrData ? "font-medium text-emerald-600 dark:text-emerald-400" : "font-medium text-rose-600 dark:text-rose-400"}>
                      {v.qrData ? "Assigned" : "Not assigned"}
                    </span>
                  </p>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Owner contact
                      </p>
                      <ContactToggle
                        label="Owner contact"
                        checked={Boolean(v.ownerContactVisible)}
                        onClick={() => handleToggleVisibility(v, "ownerContactVisible")}
                        disabled={Boolean(toggleSaving[`${v._id}:ownerContactVisible`])}
                        tone="green"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Driver contact
                      </p>
                      <ContactToggle
                        label="Driver contact"
                        checked={Boolean(v.driverContactVisible)}
                        onClick={() => handleToggleVisibility(v, "driverContactVisible")}
                        disabled={Boolean(toggleSaving[`${v._id}:driverContactVisible`])}
                        tone="blue"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Emergency contact
                      </p>
                      <ContactToggle
                        label="Emergency contact"
                        checked={Boolean(v.emergencyContactVisible)}
                        onClick={() => handleToggleVisibility(v, "emergencyContactVisible")}
                        disabled={Boolean(toggleSaving[`${v._id}:emergencyContactVisible`])}
                        tone="red"
                      />
                    </div>
                  </div>

                  {inlineEditor[v._id] ? (
                    <div className="mt-2 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Add required contact
                      </p>

                      {inlineEditor[v._id].target === "ownerContactVisible" ? (
                        <input
                          className={fieldInput}
                          placeholder="Owner phone (11 digit)"
                          value={inlineEditor[v._id].ownerPhone}
                          onChange={(e) =>
                            setInlineEditor((prev) => ({
                              ...prev,
                              [v._id]: {
                                ...prev[v._id],
                                ownerPhone: e.target.value.replace(/\D/g, "").slice(0, 11),
                              },
                            }))
                          }
                        />
                      ) : null}

                      {inlineEditor[v._id].target === "emergencyContactVisible" ? (
                        <input
                          className={fieldInput}
                          placeholder="Emergency phone (11 digit)"
                          value={inlineEditor[v._id].emergencyPhone}
                          onChange={(e) =>
                            setInlineEditor((prev) => ({
                              ...prev,
                              [v._id]: {
                                ...prev[v._id],
                                emergencyPhone: e.target.value.replace(/\D/g, "").slice(0, 11),
                              },
                            }))
                          }
                        />
                      ) : null}

                      {inlineEditor[v._id].target === "driverContactVisible" ? (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <input
                            className={fieldInput}
                            placeholder="Driver name"
                            value={inlineEditor[v._id].driverName}
                            onChange={(e) =>
                              setInlineEditor((prev) => ({
                                ...prev,
                                [v._id]: { ...prev[v._id], driverName: e.target.value },
                              }))
                            }
                          />
                          <input
                            className={fieldInput}
                            placeholder="Driver phone (11 digit)"
                            value={inlineEditor[v._id].driverPhone}
                            onChange={(e) =>
                              setInlineEditor((prev) => ({
                                ...prev,
                                [v._id]: {
                                  ...prev[v._id],
                                  driverPhone: e.target.value.replace(/\D/g, "").slice(0, 11),
                                },
                              }))
                            }
                          />
                        </div>
                      ) : null}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveInlineContact(v)}
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => closeInlineEditor(v._id)}
                          className="rounded-md bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex w-full items-center justify-between gap-3 md:w-auto md:flex-col md:items-center">

{/* ACTIONS */}
<div className="flex gap-2">

  {/* EDIT */}
  <button
    type="button"
    onClick={() => setEditVehicle(v)}
    className="flex items-center justify-center rounded-lg  p-2
    bg-white text-slate-700
    hover:bg-slate-100 hover:border-amber-600 hover:text-amber-700
    dark:bg-slate-800 dark:text-slate-50 dark:border-slate-400
    dark:hover:bg-amber-500 dark:hover:text-slate-900 dark:hover:border-amber-300
    transition"
    title="Edit"
  >
    <Pencil className="h-4 w-4" />
  </button>

  {/* DELETE */}
  {role === "admin" && (
    <button
      type="button"
      onClick={() => handleDelete(v._id)}
      className={`
        flex items-center justify-center rounded-lg p-2
        bg-white text-rose-700
        hover:bg-rose-50 hover:border-rose-600 hover:text-rose-800
        dark:bg-slate-900 dark:text-rose-300 dark:border-slate-400
        dark:hover:bg-rose-600 dark:hover:text-white dark:hover:border-rose-500
        transition
      `}
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )}
 

</div>
                  {/* RIGHT SIDE - QR IMAGE */}
                  <div className="flex flex-col items-center min-w-[96px]">
                    {qr?.qrCode ? (
                      <>
                        <img
                          src={qr.qrCode}
                          alt="QR"
                          className="h-[86px] w-[86px] rounded"
                        />
                        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                          {qr.code}
                        </p>
                      </>
                    ) : v.qrData ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${v.qrData}`}
                        alt="QR"
                        className="h-[86px] w-[86px] rounded"
                      />
                    ) : (
                      <p className={`text-xs ${textMuted}`}>No QR</p>
                    )}
                  </div>

                
                </div>

              </div>
            );
          })
        )}

        {/* VIEW MODAL */}
        {viewVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setViewVehicle(null)}
          >
            <div className={`w-80 rounded-xl p-4 shadow-lg ${cardSurfaceSm}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={`font-bold ${textHeading}`}>Vehicle Details</h2>
              <p className={textMuted}>{viewVehicle.vehicleName}</p>
              <p className={textMuted}>{viewVehicle.model}</p>
              <p className={textMuted}>{viewVehicle.plate}</p>

              <button
                type="button"
                onClick={() => setViewVehicle(null)}
                className={`mt-2 w-full ${btnSecondaryInline}`}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setEditVehicle(null)}
          >
            <div className={`w-80 space-y-3 p-4 shadow-lg ${cardSurfaceSm}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={`text-center font-bold ${textHeading}`}>Edit Vehicle</h2>

              <label className="space-y-1">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Vehicle name
                </span>
                <input
                  value={editVehicle.vehicleName}
                  onChange={(e) =>
                    setEditVehicle({ ...editVehicle, vehicleName: e.target.value })
                  }
                  className={fieldInput}
                />
              </label>

              <label className="space-y-1">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Model
                </span>
                <input
                  value={editVehicle.model}
                  onChange={(e) =>
                    setEditVehicle({ ...editVehicle, model: e.target.value })
                  }
                  className={fieldInput}
                />
              </label>

              <label className="space-y-1">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Plate
                </span>
                <input
                  value={editVehicle.plate}
                  onChange={(e) =>
                    setEditVehicle({ ...editVehicle, plate: e.target.value })
                  }
                  className={fieldInput}
                />
              </label>

              <label className="space-y-1">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Owner phone
                </span>
                <input
                  value={editVehicle.ownerPhone || ""}
                  onChange={(e) =>
                    setEditVehicle({ ...editVehicle, ownerPhone: e.target.value })
                  }
                  placeholder="Owner phone"
                  className={fieldInput}
                />
              </label>

              <label className="space-y-1">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Emergency phone
                </span>
                <input
                  value={editVehicle.emergencyPhone || ""}
                  onChange={(e) =>
                    setEditVehicle({ ...editVehicle, emergencyPhone: e.target.value })
                  }
                  placeholder="Emergency phone"
                  className={fieldInput}
                />
              </label>

              <label className="space-y-1">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Driver name
                </span>
                <input
                  value={editVehicle?.driver?.name || ""}
                  onChange={(e) =>
                    setEditVehicle({
                      ...editVehicle,
                      driver: { ...(editVehicle?.driver || {}), name: e.target.value },
                    })
                  }
                  placeholder="Driver name"
                  className={fieldInput}
                />
              </label>

              <label className="space-y-1">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Driver phone
                </span>
                <input
                  value={editVehicle?.driver?.phone || ""}
                  onChange={(e) =>
                    setEditVehicle({
                      ...editVehicle,
                      driver: { ...(editVehicle?.driver || {}), phone: e.target.value },
                    })
                  }
                  placeholder="Driver phone"
                  className={fieldInput}
                />
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUpdate}
                  className={`flex-1 ${btnPrimaryInline} py-2.5`}
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => setEditVehicle(null)}
                  className={`flex-1 ${btnSecondaryInline} py-2.5`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyVehiclePage;