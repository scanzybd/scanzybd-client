import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
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

  // ---------------- LOAD VEHICLES ----------------
  const loadVehicles = useCallback(async () => {
    try {
      const res = await axiosSecure.get("/api/vehicle");

      const available = (res.data.data || []).filter(
        (v) => v.qrData == null
      );

      setVehicles(available);
    } catch (err) {
      console.log(err);
    }
  }, [axiosSecure]);

  // ---------------- LOAD QR ----------------
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

  // ---------------- INIT LOAD ----------------
  useEffect(() => {
    loadVehicles();
    loadQR();
  }, [loadVehicles, loadQR]);

  // ---------------- FILTER (OPTIMIZED) ----------------
  const filteredVehicles = useMemo(() => {
    const search = vehicleSearch.toLowerCase();
    return vehicles.filter((v) =>
      `${v.vehicleName} ${v.plate}`.toLowerCase().includes(search)
    );
  }, [vehicles, vehicleSearch]);

  const filteredQR = useMemo(() => {
    const search = qrSearch.toLowerCase();
    return qrList.filter((q) => {
      const unassigned =
        !q.isAssigned && q.status !== "assigned";
      return (
        unassigned && (q.code ?? "").toLowerCase().includes(search)
      );
    });
  }, [qrList, qrSearch]);

  // ---------------- ASSIGN QR (OPTIMISTIC + FAST) ----------------
  const handleAssignQR = async (qrId) => {
    if (!selectedVehicle) return;

    const finalQrId = qrIdFromURL || qrId;

    const vehicleId = selectedVehicle._id;

    try {
      // ⚡ OPTIMISTIC UPDATE (instant UI remove)
      setVehicles((prev) =>
        prev.filter((v) => v._id !== vehicleId)
      );

      setSelectedVehicle(null);

      // 1️⃣ QR assign
      await axiosSecure.post("/api/qr/assign", {
        qrId: finalQrId,
        vehicleId,
      });

      // 2️⃣ Vehicle update
      await axiosSecure.post(`/api/vehicle/update/${vehicleId}`, {
        qrData: finalQrId,
      });

      // 🔄 silent sync refresh (no UI lag)
      loadVehicles();

      alert("✅ Assigned Successfully");
    } catch (err) {
      console.log(err);

      // ❌ rollback on error
      loadVehicles();

      alert("❌ Assign Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5 flex justify-center">
      <div className="w-full max-w-md space-y-4">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-xl font-bold">Assign QR to Vehicle</h1>
          {qrIdFromURL && (
            <p className="text-xs text-gray-500">
              URL QR: {qrIdFromURL}
            </p>
          )}
        </div>

        {/* SEARCH VEHICLE */}
        <input
          value={vehicleSearch}
          onChange={(e) => setVehicleSearch(e.target.value)}
          placeholder="Search vehicle..."
          className="w-full p-3 border rounded-xl"
        />

        {/* VEHICLE LIST */}
        <div className="space-y-2">
          {filteredVehicles.map((v) => (
            <div
              key={v._id}
              className="bg-white p-3 rounded-xl flex justify-between items-center shadow"
            >
              <div>
                <p className="font-semibold">{v.vehicleName}</p>
                <p className="text-xs text-gray-500">{v.plate}</p>
              </div>

              <button
                onClick={() => setSelectedVehicle(v)}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                Assign
              </button>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {selectedVehicle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-xl w-80 space-y-3">

              <h2 className="font-bold text-center">
                Assign QR → {selectedVehicle.vehicleName}
              </h2>

              <input
                value={qrSearch}
                onChange={(e) => setQrSearch(e.target.value)}
                placeholder="Search QR..."
                className="w-full p-2 border rounded"
              />

              {/* QR LIST */}
              <div className="max-h-40 overflow-y-auto space-y-2">
                {filteredQR.map((q) => (
                  <div
                    key={q._id}
                    className="flex justify-between items-center border p-2 rounded"
                  >
                    <span>{q.code}</span>

                    <button
                      onClick={() => handleAssignQR(q._id)}
                      className="bg-blue-500 text-white px-2 py-1 text-xs rounded"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => alert("📷 QR Scanner will open")}
                className="w-full bg-yellow-500 text-white py-1 rounded"
              >
                Scan QR
              </button>

              <button
                onClick={() => setSelectedVehicle(null)}
                className="w-full bg-red-500 text-white py-1 rounded"
              >
                Close
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AssignVehiclePage;