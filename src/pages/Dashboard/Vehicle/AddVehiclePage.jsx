import React, { useEffect, useRef, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Html5Qrcode } from "html5-qrcode";
import { Car, Hash, Phone, QrCode, UserPlus, ScanLine } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useMongoProfile from "../../../hooks/useMongoProfile";
import SmartLoader from "../../../components/SmartLoader";

const AddVehiclePage = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { data: mongoUser, isLoading: roleLoading } = useMongoProfile(
    Boolean(user?.email)
  );

  const [form, setForm] = useState({
    vehicleName: "",
    model: "",
    plate: "",
    ownerPhone: "",
  });

  const [driver, setDriver] = useState({
    name: "",
    phone: "",
  });

  const [showDriverForm, setShowDriverForm] = useState(false);

  const [scanning, setScanning] = useState(false);
  const [scannedQR, setScannedQR] = useState(null);

  const [assignableUsers, setAssignableUsers] = useState([]);
  const [assignableLoading, setAssignableLoading] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");

  const scannerRef = useRef(null);

  const role = mongoUser?.role || "user";
  const isStaffAdd = useMemo(
    () => role === "admin" || role === "provider",
    [role]
  );

  useEffect(() => {
    if (!isStaffAdd) return;
    let cancelled = false;
    (async () => {
      setAssignableLoading(true);
      try {
        const res = await axiosSecure.get("/api/users/assignable");
        if (!cancelled) setAssignableUsers(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setAssignableLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isStaffAdd, axiosSecure]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDriverChange = (e) => {
    setDriver({ ...driver, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.vehicleName || !form.model || !form.plate || !form.ownerPhone) {
      alert("Fill all required fields.");
      return;
    }

    if (!mongoUser?._id) {
      alert("Could not load your profile. Please sign in again.");
      return;
    }

    if (isStaffAdd && !selectedOwnerId) {
      alert("Select the customer user who owns this vehicle.");
      return;
    }

    try {
      const payload = {
        ...form,
        owner: isStaffAdd ? selectedOwnerId : mongoUser._id,
        driver: showDriverForm ? driver : null,
        qrData: scannedQR || null,
      };

      await axiosSecure.post("/api/vehicle/add", payload);

      await queryClient.invalidateQueries({ queryKey: ["dashboard", "vehicles"] });

      alert("Vehicle added successfully.");

      setForm({
        vehicleName: "",
        model: "",
        plate: "",
        ownerPhone: "",
      });

      setDriver({ name: "", phone: "" });
      setShowDriverForm(false);
      setScannedQR(null);
      setSelectedOwnerId("");
    } catch (err) {
      console.log(err);
      alert("Failed to add vehicle.");
    }
  };

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5Qrcode("add-vehicle-reader");
    scannerRef.current = scanner;

    Html5Qrcode.getCameras().then((devices) => {
      if (!devices?.length) return;

      scanner.start(
        devices[0].id,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          scanner.stop();
          setScanning(false);
          const code = text.split("/").pop();
          setScannedQR(code);
        }
      );
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [scanning]);

  if (roleLoading) {
    return <SmartLoader fullPage label="Checking permissions..." />;
  }

  const canScanQR = role === "admin" || role === "provider";

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 border-b border-slate-200/90 pb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          <Car className="h-3.5 w-3.5" />
          Fleet
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Add vehicle
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {isStaffAdd
            ? "Register a vehicle for a customer account and optionally link a driver or QR tag."
            : "Register a vehicle and optionally link a driver or QR tag."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm"
      >
        {isStaffAdd && (
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4">
            <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-900">
              <UserPlus className="h-3.5 w-3.5" />
              Vehicle owner (customer)
            </label>
            <select
              className="select select-bordered mt-1 w-full rounded-xl border-slate-200 bg-white focus:border-emerald-500"
              value={selectedOwnerId}
              onChange={(e) => setSelectedOwnerId(e.target.value)}
              required={isStaffAdd}
            >
              <option value="">Select customer user…</option>
              {assignableUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} — {u.email}
                </option>
              ))}
            </select>
            {assignableLoading && (
              <p className="mt-2 text-xs text-slate-500">Loading users…</p>
            )}
            {!assignableLoading && assignableUsers.length === 0 && (
              <p className="mt-2 text-xs text-amber-800">
                No customer accounts found. Create users first (User management).
              </p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Vehicle name
          </label>
          <input
            name="vehicleName"
            value={form.vehicleName}
            onChange={handleChange}
            placeholder="e.g. Toyota Axio"
            className="input input-bordered w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          />
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Hash className="h-3 w-3" /> Model
          </label>
          <input
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="Model year / variant"
            className="input input-bordered w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Plate number
          </label>
          <input
            name="plate"
            value={form.plate}
            onChange={handleChange}
            placeholder="Dhaka Metro 00-0000"
            className="input input-bordered w-full rounded-xl border-slate-200 font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          />
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Phone className="h-3 w-3" /> Owner phone
          </label>
          <input
            name="ownerPhone"
            value={form.ownerPhone}
            onChange={handleChange}
            placeholder="01XXXXXXXXX"
            className="input input-bordered w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          />
        </div>

        <button
          type="button"
          onClick={() => setShowDriverForm(!showDriverForm)}
          className={`btn btn-block gap-2 rounded-xl border ${
            showDriverForm
              ? "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100"
              : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          {showDriverForm ? "Remove driver" : "Add driver (optional)"}
        </button>

        {showDriverForm && (
          <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
            <input
              name="name"
              value={driver.name}
              onChange={handleDriverChange}
              placeholder="Driver name"
              className="input input-bordered w-full rounded-xl border-slate-200 bg-white"
            />
            <input
              name="phone"
              value={driver.phone}
              onChange={handleDriverChange}
              placeholder="Driver phone"
              className="input input-bordered w-full rounded-xl border-slate-200 bg-white"
            />
          </div>
        )}

        {canScanQR && (
          <div className="rounded-xl border border-dashed border-emerald-200/80 bg-emerald-50/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900">
              <QrCode className="h-4 w-4" />
              Link QR code
            </div>
            {!scanning ? (
              <button
                type="button"
                onClick={() => setScanning(true)}
                className="btn btn-block gap-2 rounded-xl border-0 bg-amber-400 font-semibold text-slate-900 hover:bg-amber-500"
              >
                <ScanLine className="h-4 w-4" />
                Scan QR
              </button>
            ) : (
              <div className="overflow-hidden rounded-xl bg-black">
                <div id="add-vehicle-reader" className="min-h-[240px]" />
              </div>
            )}
            {scannedQR && (
              <p className="mt-2 break-all text-xs font-mono text-emerald-800">
                Captured: {scannedQR}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-block gap-2 rounded-xl border-0 bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600"
        >
          Save vehicle
        </button>
      </form>
    </div>
  );
};

export default AddVehiclePage;
