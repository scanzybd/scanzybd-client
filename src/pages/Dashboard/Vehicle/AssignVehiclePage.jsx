import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Search, Car, QrCode, X } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";

const AssignVehiclePage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const location = useLocation();

  const [vehicleSearch, setVehicleSearch] = useState("");
  const [qrSearch, setQrSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const qrIdFromURL = new URLSearchParams(location.search).get("qrId");

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ["dashboard", "vehicles", "assign", "unassigned"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/vehicle");
      const all = res.data.data || [];
      return all.filter((v) => v.qrData == null);
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

  const showInitialFullLoader =
    vehiclesLoading &&
    qrLoading &&
    vehicles.length === 0 &&
    qrList.length === 0;

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
    if (!selectedVehicle) return;

    const code =
      typeof pickedCode === "string" && pickedCode.length > 0
        ? pickedCode
        : qrIdFromURL;
    if (!code) {
      alert("No QR code to assign.");
      return;
    }

    const vehicleId = selectedVehicle._id;

    try {
      setSelectedVehicle(null);

      await axiosSecure.post("/api/qr/assign", {
        code,
        vehicleId,
      });

      await queryClient.invalidateQueries({ queryKey: ["dashboard", "vehicles"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "qr"] });

      alert("Assigned successfully.");
    } catch (err) {
      console.log(err);
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "vehicles"] });
      alert("Assign failed. Try again.");
    }
  };

  if (showInitialFullLoader) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <SmartLoader label="Loading vehicles & QR codes…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 border-b border-slate-200/90 pb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          <Link2 className="h-3.5 w-3.5" />
          Assign
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Assign QR to vehicle
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pick a vehicle without QR, then choose an unassigned code.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-800">Vehicles (no QR)</h2>
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
              className="input input-bordered input-sm w-full rounded-lg border-slate-200 pl-9"
            />
          </div>
          <ul className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
            {filteredVehicles.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate-500">
                {vehicles.length === 0
                  ? "No unassigned vehicles."
                  : "No matches."}
              </li>
            ) : (
              filteredVehicles.map((v) => (
                <li key={v._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedVehicle(v)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedVehicle?._id === v._id
                        ? "bg-emerald-50 ring-1 ring-emerald-200"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Car className="h-4 w-4 shrink-0 text-slate-500" />
                    <span className="font-medium text-slate-900">{v.vehicleName}</span>
                    <span className="font-mono text-xs text-emerald-700">{v.plate}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-800">Unassigned QR codes</h2>
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
              className="input input-bordered input-sm w-full rounded-lg border-slate-200 pl-9"
            />
          </div>
          <ul className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
            {filteredQR.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate-500">
                No unassigned codes match.
              </li>
            ) : (
              filteredQR.map((q) => (
                <li key={q._id ?? q.code}>
                  <button
                    type="button"
                    onClick={() => handleAssignQR(q.code)}
                    disabled={!selectedVehicle}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    <QrCode className="h-4 w-4 text-emerald-600" />
                    <span className="font-mono text-xs">{q.code}</span>
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
