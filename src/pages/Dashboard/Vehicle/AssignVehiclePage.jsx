import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Link2, Search, Car, QrCode, X } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const AssignVehiclePage = () => {
  const axiosSecure = useAxiosSecure();
  const location = useLocation();

  const [vehicles, setVehicles] = useState([]);
  const [qrList, setQrList] = useState([]);

  const [vehicleSearch, setVehicleSearch] = useState("");
  const [qrSearch, setQrSearch] = useState("");

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const qrIdFromURL = new URLSearchParams(location.search).get("qrId");

  const loadVehicles = useCallback(async () => {
    try {
      const res = await axiosSecure.get("/api/vehicle");

      const available = (res.data.data || []).filter((v) => v.qrData == null);

      setVehicles(available);
    } catch (err) {
      console.log(err);
    }
  }, [axiosSecure]);

  const loadQR = useCallback(async () => {
    try {
      const res = await axiosSecure.get("/api/qr/allQR");
      const payload = res.data;
      const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
      setQrList(list);
    } catch (err) {
      console.log(err);
    }
  }, [axiosSecure]);

  useEffect(() => {
    loadVehicles();
    loadQR();
  }, [loadVehicles, loadQR]);

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
      setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
      setSelectedVehicle(null);

      await axiosSecure.post("/api/qr/assign", {
        code,
        vehicleId,
      });

      loadVehicles();

      alert("Assigned successfully.");
    } catch (err) {
      console.log(err);
      loadVehicles();
      alert("Assign failed. Try again.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 border-b border-slate-200/90 pb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          <Link2 className="h-3.5 w-3.5" />
          Linking
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Assign QR to vehicle
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pick a vehicle without a tag, then choose an available QR code.
        </p>
        {qrIdFromURL && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-mono text-amber-900">
            From URL: <span className="font-semibold">{qrIdFromURL}</span>
          </p>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={vehicleSearch}
          onChange={(e) => setVehicleSearch(e.target.value)}
          placeholder="Search vehicles without QR..."
          className="input input-bordered w-full rounded-xl border-slate-200 bg-white pl-10 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center">
          <Car className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-2 font-medium text-slate-700">No unassigned vehicles</p>
          <p className="text-sm text-slate-500">Add a vehicle first, or clear search.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredVehicles.map((v) => (
            <li
              key={v._id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-emerald-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{v.vehicleName}</p>
                <p className="font-mono text-sm text-emerald-700">{v.plate}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVehicle(v)}
                className="btn shrink-0 rounded-xl border-0 bg-emerald-500 px-5 font-semibold text-white hover:bg-emerald-600"
              >
                Choose & assign
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedVehicle && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setSelectedVehicle(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Select QR code</h2>
                <p className="text-sm text-slate-600">
                  For <span className="font-semibold">{selectedVehicle.vehicleName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={qrSearch}
                onChange={(e) => setQrSearch(e.target.value)}
                placeholder="Search by code..."
                className="input input-bordered w-full rounded-xl border-slate-200 pl-10 text-sm"
              />
            </div>

            {qrIdFromURL && (
              <button
                type="button"
                onClick={() => handleAssignQR()}
                className="btn btn-block mb-3 gap-2 rounded-xl border-amber-200 bg-amber-50 font-semibold text-amber-950 hover:bg-amber-100"
              >
                Assign using QR from link
              </button>
            )}

            <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-2">
              {filteredQR.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No matching QR codes.</p>
              ) : (
                filteredQR.map((q) => (
                  <div
                    key={q._id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2"
                  >
                    <span className="flex items-center gap-2 truncate font-mono text-sm text-slate-800">
                      <QrCode className="h-4 w-4 shrink-0 text-emerald-600" />
                      {q.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAssignQR(q.code)}
                      className="btn btn-sm shrink-0 rounded-lg border-0 bg-slate-900 font-medium text-white hover:bg-slate-800"
                    >
                      Assign
                    </button>
                  </div>
                ))
              )}
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
              If QR came from a link, assignment uses URL id when applicable.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignVehiclePage;
