import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link2, Car, QrCode } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";
import {
  cardSurface,
  dashboardBadge,
  dashboardPageHeader,
  dashboardPageSubtitle,
  dashboardPageTitle,
} from "../../../lib/uiClasses";
import { canAssignMoreQr, qrAssignmentLabel } from "../../../lib/vehicleQr";

const AssignVehiclebyId = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [qrAssigned, setQrAssigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        if (code) {
          const res = await axiosSecure.get(`/api/qr/code/${encodeURIComponent(code)}`);
          if (!cancelled) {
            const qr = res.data?.qr;
            const assigned = qr?.status === "assigned" || qr?.isAssigned === true;
            setQrAssigned(assigned);
          }
        }

        const res = await axiosSecure.get("/api/vehicle");
        if (!cancelled) {
          const available = (res.data.data || []).filter((v) => canAssignMoreQr(v));
          setVehicles(available);
        }
      } catch (err) {
        console.log(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [axiosSecure, code]);

  const handleAssign = async () => {
    if (!code || !selectedVehicle || assigning) return;

    setAssigning(true);
    try {
      await axiosSecure.post("/api/qr/assign", {
        code,
        vehicleId: selectedVehicle,
      });

      alert("Assigned successfully.");
      navigate("/dashboard/scan-assign-vehicle");
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Assignment failed.");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <SmartLoader label="Loading QR & vehicles…" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-lg">
      {assigning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]"
          aria-busy="true"
          aria-live="polite"
        >
          <SmartLoader label="Assigning QR to vehicle…" />
        </div>
      )}

      <div className={dashboardPageHeader}>
        <div className={dashboardBadge}>
          <Link2 className="h-3.5 w-3.5" />
          Quick assign
        </div>
        <h1 className={dashboardPageTitle}>
          Assign vehicle
        </h1>
        <p className={dashboardPageSubtitle}>
          Link this QR to a vehicle that has fewer than 2 tags.
        </p>
      </div>

      <div
        className={`p-6 ${cardSurface} ${
          assigning ? "pointer-events-none opacity-60" : ""
        }`}
      >
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
          disabled={assigning || qrAssigned}
          className="select select-bordered mb-6 w-full rounded-xl border-slate-200 focus:border-emerald-500 disabled:opacity-60"
        >
          <option value="">Select vehicle</option>

          {vehicles.map((v) => (
            <option key={v._id} value={v._id}>
              {v.vehicleName} — {v.plate} ({qrAssignmentLabel(v)})
            </option>
          ))}
        </select>

        {vehicles.length === 0 && (
          <p className="mb-4 text-sm text-amber-800">
            All vehicles already have 2 QR codes. Add a vehicle or free a slot first.
          </p>
        )}

        <button
          type="button"
          onClick={handleAssign}
          disabled={!selectedVehicle || !code || assigning || qrAssigned}
          className="btn btn-block gap-2 rounded-xl border-0 bg-emerald-500 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {assigning ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Assigning…
            </>
          ) : (
            "Confirm assignment"
          )}
        </button>
      </div>
    </div>
  );
};

export default AssignVehiclebyId;
