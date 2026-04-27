import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link2, Car, QrCode } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const AssignVehiclebyId = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [qrAssigned, setQrAssigned] = useState(false);

  useEffect(() => {
    const loadQrStatus = async () => {
      try {
        if (!code) return;
        const res = await axiosSecure.get(`/api/qr/code/${encodeURIComponent(code)}`);
        const qr = res.data?.qr;
        const assigned = qr?.status === "assigned" || qr?.isAssigned === true;
        setQrAssigned(assigned);
      } catch (err) {
        console.log(err);
      }
    };

    const loadVehicles = async () => {
      try {
        const res = await axiosSecure.get("/api/vehicle");

        const available = (res.data.data || []).filter((v) => !v.qrData);

        setVehicles(available);
      } catch (err) {
        console.log(err);
      }
    };

    loadQrStatus();
    loadVehicles();
  }, [axiosSecure, code]);

  const handleAssign = async () => {
    try {
      if (!code || !selectedVehicle) {
        alert("Select a vehicle.");
        return;
      }

      await axiosSecure.post("/api/qr/assign", {
        code,
        vehicleId: selectedVehicle,
      });

      alert("Assigned successfully.");
      navigate("/dashboard/scan-assign-vehicle");
    } catch (err) {
      console.log(err);
      alert("Assignment failed.");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 border-b border-slate-200/90 pb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          <Link2 className="h-3.5 w-3.5" />
          Quick assign
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Assign vehicle
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Link this QR code to a vehicle that has no tag yet.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              QR code
            </p>
            <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900">
              {code || "—"}
            </p>
            {qrAssigned && (
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                assigned
              </p>
            )}
          </div>
        </div>

        <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Car className="h-3.5 w-3.5" />
          Vehicle
        </label>
        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="select select-bordered mb-6 w-full rounded-xl border-slate-200 focus:border-emerald-500"
        >
          <option value="">Select vehicle</option>

          {vehicles.map((v) => (
            <option key={v._id} value={v._id}>
              {v.vehicleName} — {v.plate}
            </option>
          ))}
        </select>

        {vehicles.length === 0 && (
          <p className="mb-4 text-sm text-amber-800">
            No vehicles without a QR. Add a vehicle first.
          </p>
        )}

        <button
          type="button"
          onClick={handleAssign}
          disabled={!selectedVehicle || !code}
          className="btn btn-block rounded-xl border-0 bg-emerald-500 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          Confirm assignment
        </button>
      </div>
    </div>
  );
};

export default AssignVehiclebyId;
