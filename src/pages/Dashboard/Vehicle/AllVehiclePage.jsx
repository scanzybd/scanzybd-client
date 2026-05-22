import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Car,
  QrCode,
  Search,
  UserRound,
  Phone,
  AlertCircle,
  Mail,
  Pencil,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import useMongoProfile from "../../../hooks/useMongoProfile";
import SmartLoader from "../../../components/SmartLoader";
import VehicleQrPreview from "../../../components/VehicleQrPreview";
import {
  canAssignMoreQr,
  getVehicleQrIds,
  qrAssignmentLabel,
} from "../../../lib/vehicleQr";

const fieldClass =
  "input input-bordered input-sm w-full rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-800";

const AllVehiclePage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { user, userRole } = useAuth();
  const { data: mongoUser } = useMongoProfile();
  const isAdmin = userRole === "admin" || mongoUser?.role === "admin";

  const [search, setSearch] = useState("");
  const [editVehicle, setEditVehicle] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [qrPickerSearch, setQrPickerSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const {
    data: vehicles = [],
    isLoading: vehiclesLoading,
    isError: vehiclesError,
  } = useQuery({
    queryKey: ["dashboard", "vehicles", "all"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/vehicle");
      return res.data.data || [];
    },
    staleTime: 20_000,
  });

  const { data: qrList = [], isLoading: qrLoading } = useQuery({
    queryKey: ["dashboard", "qr", "all"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/qr/allQR");
      const payload = res.data;
      return Array.isArray(payload) ? payload : payload?.data ?? [];
    },
    staleTime: 20_000,
  });

  const qrMap = useMemo(() => {
    const map = {};
    for (const q of qrList) {
      if (q?._id) map[String(q._id)] = q;
    }
    return map;
  }, [qrList]);

  const unassignedQr = useMemo(
    () =>
      qrList.filter((q) => !q.isAssigned && q.status !== "assigned"),
    [qrList]
  );

  const filteredPickerQr = useMemo(() => {
    const q = qrPickerSearch.toLowerCase();
    return unassignedQr.filter((row) =>
      String(row.code || "").toLowerCase().includes(q)
    );
  }, [unassignedQr, qrPickerSearch]);

  const filteredVehicles = useMemo(() => {
    const q = search.toLowerCase();
    return vehicles.filter((v) => {
      const base = `${v.vehicleName} ${v.model} ${v.plate}`;
      const contact = isAdmin
        ? ` ${v.ownerPhone || ""} ${v.emergencyPhone || ""} ${v.driver?.phone || ""} ${v.owner?.email || ""} ${v.owner?.name || ""}`
        : "";
      return `${base}${contact}`.toLowerCase().includes(q);
    });
  }, [vehicles, search, isAdmin]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["dashboard", "vehicles"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard", "qr"] });
  };

  const handleUpdate = async () => {
    if (!editVehicle?._id) return;
    try {
      const driverName = editVehicle?.driver?.name?.trim?.() || "";
      const driverPhone = editVehicle?.driver?.phone?.trim?.() || "";
      await axiosSecure.post(`/api/vehicle/update/${editVehicle._id}`, {
        vehicleName: editVehicle.vehicleName,
        model: editVehicle.model,
        plate: editVehicle.plate,
        ownerPhone: editVehicle.ownerPhone,
        emergencyPhone: editVehicle.emergencyPhone,
        ownerContactVisible: editVehicle.ownerContactVisible,
        driverContactVisible: editVehicle.driverContactVisible,
        emergencyContactVisible: editVehicle.emergencyContactVisible,
        driver:
          driverName && driverPhone
            ? { name: driverName, phone: driverPhone }
            : null,
      });
      setEditVehicle(null);
      await refresh();
      Swal.fire("Saved", "Vehicle updated.", "success");
    } catch (err) {
      Swal.fire("Failed", err?.response?.data?.message || "Update failed", "error");
    }
  };

  const handleDelete = async (v) => {
    const result = await Swal.fire({
      title: "Delete vehicle?",
      text: `${v.vehicleName} (${v.plate}) — linked QR codes will be unassigned.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    setBusyId(v._id);
    try {
      await axiosSecure.delete(`/api/vehicle/delete/${v._id}`);
      await refresh();
      Swal.fire("Deleted", "Vehicle removed.", "success");
    } catch (err) {
      Swal.fire("Failed", err?.response?.data?.message || "Delete failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleAssignQr = async (vehicle, code) => {
    setBusyId(`${vehicle._id}-assign`);
    try {
      await axiosSecure.post("/api/qr/assign", {
        code,
        vehicleId: vehicle._id,
      });
      await refresh();
      const updated = (await axiosSecure.get("/api/vehicle")).data?.data?.find(
        (row) => String(row._id) === String(vehicle._id)
      );
      if (updated && canAssignMoreQr(updated)) {
        setAssignTarget(updated);
        Swal.fire("Assigned", "You can assign one more QR to this vehicle.", "success");
      } else {
        setAssignTarget(null);
        Swal.fire("Assigned", "QR linked to vehicle.", "success");
      }
    } catch (err) {
      Swal.fire("Failed", err?.response?.data?.message || "Assign failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleUnassignQr = async (vehicle, qrId) => {
    const qr = qrMap[String(qrId)];
    const result = await Swal.fire({
      title: "Remove QR from vehicle?",
      text: qr?.code ? `Code: ${qr.code}` : "QR will become unassigned.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Remove",
    });
    if (!result.isConfirmed) return;

    setBusyId(`${vehicle._id}-${qrId}`);
    try {
      await axiosSecure.post("/api/qr/unassign", {
        vehicleId: vehicle._id,
        qrId,
      });
      await refresh();
      Swal.fire("Removed", "QR is unassigned and can be used again.", "success");
    } catch (err) {
      Swal.fire("Failed", err?.response?.data?.message || "Remove failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-[60vh]">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-200/90 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Car className="h-3.5 w-3.5" />
            Fleet
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            All vehicles
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Edit, assign or remove QR (max 2 per vehicle).{" "}
            <span className="font-medium text-slate-800">{user?.email}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/dashboard/assign-vehicle"
            className="btn btn-outline btn-sm gap-1 rounded-xl"
          >
            <QrCode className="h-4 w-4" />
            Assign page
          </Link>
          <div className="relative w-full min-w-[200px] max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isAdmin
                  ? "Search name, plate, phone, email..."
                  : "Search by name, model, plate..."
              }
              className="input input-bordered w-full rounded-xl border-slate-200 bg-white pl-10 pr-4 shadow-sm focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {vehiclesLoading && (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <SmartLoader label="Loading vehicles..." />
        </div>
      )}

      {vehiclesError && !vehiclesLoading && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Could not load vehicles. Try refreshing.
        </p>
      )}

      {!vehiclesLoading && !vehiclesError && filteredVehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center">
          <Car className="h-12 w-12 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">No vehicles match</p>
        </div>
      )}

      {!vehiclesLoading && !vehiclesError && filteredVehicles.length > 0 && (
        <ul className="grid gap-4 lg:grid-cols-2">
          {filteredVehicles.map((v) => {
            const vehicleQrIds = getVehicleQrIds(v);
            const isBusy = busyId === v._id || String(busyId || "").startsWith(`${v._id}-`);

            return (
              <li
                key={v._id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{v.vehicleName}</h2>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {v.model}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          vehicleQrIds.length > 0
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        <QrCode className="h-3 w-3" />
                        {qrAssignmentLabel(v)}
                      </span>
                    </div>
                    <p className="font-mono text-sm text-emerald-700">{v.plate}</p>

                    <p className="flex items-center gap-2 text-sm text-slate-700">
                      <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-medium">{v.owner?.name || "—"}</span>
                      <span className="truncate text-slate-500">{v.owner?.email}</span>
                    </p>

                    {isAdmin && (
                      <div className="space-y-1 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-sm">
                        <p className="text-[10px] font-bold uppercase text-emerald-800">
                          Contact
                        </p>
                        <p>
                          Owner:{" "}
                          <a href={`tel:${v.ownerPhone}`} className="font-mono text-emerald-800">
                            {v.ownerPhone || "—"}
                          </a>
                        </p>
                        <p>
                          Emergency:{" "}
                          <a
                            href={`tel:${v.emergencyPhone}`}
                            className="font-mono text-amber-800"
                          >
                            {v.emergencyPhone || "—"}
                          </a>
                        </p>
                        {v.driver?.phone ? (
                          <p>
                            Driver: {v.driver.name}{" "}
                            <a href={`tel:${v.driver.phone}`} className="font-mono">
                              {v.driver.phone}
                            </a>
                          </p>
                        ) : null}
                        {v.owner?.email && (
                          <p className="flex items-center gap-1 text-slate-600">
                            <Mail className="h-3.5 w-3.5" />
                            {v.owner.email}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    {qrLoading && vehicleQrIds.length > 0 ? (
                      <span className="loading loading-spinner loading-sm text-emerald-600" />
                    ) : (
                      <VehicleQrPreview vehicle={v} qrMap={qrMap} />
                    )}
                    <ul className="w-full space-y-1">
                      {vehicleQrIds.map((qid) => {
                        const qr = qrMap[String(qid)];
                        return (
                          <li
                            key={qid}
                            className="flex items-center justify-between gap-1 rounded-lg bg-white px-2 py-1 text-[10px]"
                          >
                            <span className="truncate font-mono text-slate-600">
                              {qr?.code || String(qid).slice(-8)}
                            </span>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs text-rose-600"
                              disabled={isBusy}
                              onClick={() => handleUnassignQr(v, qid)}
                            >
                              Remove
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm gap-1"
                    disabled={isBusy}
                    onClick={() => setEditVehicle({ ...v })}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  {canAssignMoreQr(v) && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm gap-1"
                      disabled={isBusy}
                      onClick={() => {
                        setAssignTarget(v);
                        setQrPickerSearch("");
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Assign QR
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline btn-error btn-sm gap-1"
                    disabled={isBusy}
                    onClick={() => handleDelete(v)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editVehicle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditVehicle(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-900">Edit vehicle</h2>
            <div className="mt-4 space-y-3">
              {[
                ["vehicleName", "Vehicle name"],
                ["model", "Model"],
                ["plate", "Plate"],
                ["ownerPhone", "Owner phone"],
                ["emergencyPhone", "Emergency phone"],
              ].map(([key, label]) => (
                <label key={key} className="block text-sm">
                  <span className="text-slate-600">{label}</span>
                  <input
                    className={`${fieldClass} mt-1`}
                    value={editVehicle[key] || ""}
                    onChange={(e) =>
                      setEditVehicle((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                </label>
              ))}
              <label className="block text-sm">
                <span className="text-slate-600">Driver name</span>
                <input
                  className={`${fieldClass} mt-1`}
                  value={editVehicle?.driver?.name || ""}
                  onChange={(e) =>
                    setEditVehicle((prev) => ({
                      ...prev,
                      driver: { ...(prev.driver || {}), name: e.target.value },
                    }))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Driver phone</span>
                <input
                  className={`${fieldClass} mt-1`}
                  value={editVehicle?.driver?.phone || ""}
                  onChange={(e) =>
                    setEditVehicle((prev) => ({
                      ...prev,
                      driver: { ...(prev.driver || {}), phone: e.target.value },
                    }))
                  }
                />
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" className="btn btn-primary flex-1" onClick={handleUpdate}>
                Save
              </button>
              <button
                type="button"
                className="btn btn-ghost flex-1"
                onClick={() => setEditVehicle(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {assignTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setAssignTarget(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Assign QR</h2>
                <p className="text-sm text-slate-600">
                  {assignTarget.vehicleName} · {assignTarget.plate} ·{" "}
                  {qrAssignmentLabel(assignTarget)}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setAssignTarget(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="border-b border-slate-100 p-4">
              <input
                className={fieldClass}
                placeholder="Search unassigned code…"
                value={qrPickerSearch}
                onChange={(e) => setQrPickerSearch(e.target.value)}
              />
            </div>
            <ul className="flex-1 overflow-y-auto p-2">
              {qrLoading ? (
                <li className="py-8 text-center text-sm text-slate-500">Loading QR codes…</li>
              ) : filteredPickerQr.length === 0 ? (
                <li className="py-8 text-center text-sm text-slate-500">
                  No unassigned QR codes.{" "}
                  <Link to="/dashboard/generate-qr" className="text-emerald-700 underline">
                    Generate more
                  </Link>
                </li>
              ) : (
                filteredPickerQr.map((q) => (
                  <li key={q._id ?? q.code}>
                    <button
                      type="button"
                      disabled={Boolean(busyId)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-emerald-50 disabled:opacity-50"
                      onClick={() => handleAssignQr(assignTarget, q.code)}
                    >
                      <QrCode className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="font-mono text-xs">{q.code}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllVehiclePage;
