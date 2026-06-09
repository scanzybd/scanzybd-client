import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Search, Car, QrCode, X } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";
import {
  dashboardPageHeader,
  dashboardPageSubtitle,
  dashboardPageTitle,
  textHeading,
} from "../../../lib/uiClasses";
import { canAssignMoreQr, getVehicleQrIds, qrAssignmentLabel } from "../../../lib/vehicleQr";

const AssignVehiclePage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const location = useLocation();

  const [vehicleSearch, setVehicleSearch] = useState("");
  const [qrSearch, setQrSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [assigningCode, setAssigningCode] = useState(null);

  const qrIdFromURL = new URLSearchParams(location.search).get("qrId");

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ["dashboard", "vehicles", "assign", "unassigned"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/vehicle");
      const all = res.data.data || [];
      return all.filter((v) => canAssignMoreQr(v));
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

  const isInitialLoading = vehiclesLoading || qrLoading;
  const isAssigning = Boolean(assigningCode);

  const filteredVehicles = useMemo(() => {
    const search = vehicleSearch.toLowerCase();
    return vehicles.filter((v) =>
      `${v.vehicleName} ${v.plate}`.toLowerCase().includes(search)
    );
  }, [vehicles, vehicleSearch]);

  const filteredQR = useMemo(() => {
    const search = qrSearch.toLowerCase();
    return qrList.filter((q) => {
      const unassigned = !q.isAssigned && q.status !== "assigned";
      return unassigned && (q.code ?? "").toLowerCase().includes(search);
    });
  }, [qrList, qrSearch]);

  const handleAssignQR = async (pickedCode) => {
    if (!selectedVehicle || isAssigning) return;

    const code =
      typeof pickedCode === "string" && pickedCode.length > 0
        ? pickedCode
        : qrIdFromURL;
    if (!code) {
      alert("No QR code to assign.");
      return;
    }

    const vehicleId = selectedVehicle._id;
    const vehicleSnapshot = selectedVehicle;

    setAssigningCode(code);

    try {
      await axiosSecure.post("/api/qr/assign", {
        code,
        vehicleId,
      });

      await queryClient.invalidateQueries({ queryKey: ["dashboard", "vehicles"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "qr"] });

      const prevId = vehicleId;
      const res = await axiosSecure.get("/api/vehicle");
      const updated = (res.data.data || []).find((v) => String(v._id) === String(prevId));
      const count = updated ? getVehicleQrIds(updated).length : 0;

      if (updated && canAssignMoreQr(updated)) {
        setSelectedVehicle(updated);
        alert(`QR assigned (${count}/2). You can assign one more to this vehicle.`);
      } else {
        setSelectedVehicle(null);
        alert(count >= 2 ? "Both QR slots filled for this vehicle." : "Assigned successfully.");
      }
    } catch (err) {
      setSelectedVehicle(vehicleSnapshot);
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "vehicles"] });
      alert(err?.response?.data?.message || "Assign failed. Try again.");
    } finally {
      setAssigningCode(null);
    }
  };

  if (isInitialLoading && vehicles.length === 0 && qrList.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <SmartLoader label="Loading vehicles & QR codes…" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-3xl">
      {isAssigning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]"
          aria-busy="true"
          aria-live="polite"
        >
          <SmartLoader label={`Assigning ${assigningCode}…`} />
        </div>
      )}
      <div className={dashboardPageHeader}>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          <Link2 className="h-3.5 w-3.5" />
          Assign
        </div>
        <h1 className={dashboardPageTitle}>
          Assign QR to vehicle
        </h1>
        <p className={dashboardPageSubtitle}>
          Pick a vehicle (up to 2 QR each), then choose an unassigned code.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className={`text-sm font-semibold ${textHeading}`}>Vehicles (can add QR)</h2>
            {vehiclesLoading && (
              <span className="loading loading-spinner loading-xs text-emerald-600" />
            )}
          </div>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              placeholder="Search vehicles…"
              className="input input-bordered input-sm w-full rounded-lg border-slate-200 pl-9 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <ul
            className={`max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900 ${
              isAssigning ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {vehiclesLoading && vehicles.length === 0 ? (
              <li className="px-3 py-8">
                <SmartLoader label="Loading vehicles…" />
              </li>
            ) : filteredVehicles.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate-500">
                {vehicles.length === 0
                  ? "All vehicles already have 2 QR codes."
                  : "No matches."}
              </li>
            ) : (
              filteredVehicles.map((v) => (
                <li key={v._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedVehicle(v)}
                    disabled={isAssigning}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition disabled:opacity-50 ${
                      selectedVehicle?._id === v._id
                        ? "bg-emerald-50 ring-1 ring-emerald-200"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Car className="h-4 w-4 shrink-0 text-slate-500" />
                    <span className="font-medium text-slate-900">{v.vehicleName}</span>
                    <span className="font-mono text-xs text-emerald-700">{v.plate}</span>
                    <span className="ml-auto text-xs text-slate-500">{qrAssignmentLabel(v)}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className={`text-sm font-semibold ${textHeading}`}>Unassigned QR codes</h2>
            {qrLoading && (
              <span className="loading loading-spinner loading-xs text-emerald-600" />
            )}
          </div>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={qrSearch}
              onChange={(e) => setQrSearch(e.target.value)}
              placeholder="Search by code…"
              className="input input-bordered input-sm w-full rounded-lg border-slate-200 pl-9 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <ul
            className={`max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900 ${
              isAssigning ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {qrLoading && qrList.length === 0 ? (
              <li className="px-3 py-8">
                <SmartLoader label="Loading QR codes…" />
              </li>
            ) : filteredQR.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate-500">
                No unassigned codes match.
              </li>
            ) : (
              filteredQR.map((q) => (
                <li key={q._id ?? q.code}>
                  <button
                    type="button"
                    onClick={() => handleAssignQR(q.code)}
                    disabled={!selectedVehicle || isAssigning}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    {assigningCode === q.code ? (
                      <span className="loading loading-spinner loading-xs text-emerald-600" />
                    ) : (
                      <QrCode className="h-4 w-4 text-emerald-600" />
                    )}
                    <span className="font-mono text-xs">{q.code}</span>
                    {assigningCode === q.code && (
                      <span className="ml-auto text-xs text-emerald-700">Assigning…</span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        {selectedVehicle && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm">
            <span className="text-slate-600">Selected:</span>
            <strong>{selectedVehicle.vehicleName}</strong>
            <span className="font-mono text-emerald-800">{selectedVehicle.plate}</span>
            <span className="text-xs text-emerald-700">{qrAssignmentLabel(selectedVehicle)}</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => setSelectedVehicle(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignVehiclePage;
