import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const AddVehiclePage = () => {
  const { user: firebaseUser } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [mongoUser, setMongoUser] = useState(null);

  const [form, setForm] = useState({
    vehicleName: "",
    model: "",
    plate: "",
    ownerPhone: "", // ✅ FIXED
  });

  const [driver, setDriver] = useState({
    name: "",
    phone: "",
  });

  const [showDriverForm, setShowDriverForm] = useState(false);

  const [scanning, setScanning] = useState(false);
  const [scannedQR, setScannedQR] = useState(null);

  const scannerRef = useRef(null);

  // ---------------- GET USER ----------------
  useEffect(() => {
    const getUser = async () => {
      if (!firebaseUser?.email) return;

      try {
        const res = await axiosSecure.get("/api/auth/me");
        setMongoUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    getUser();
  }, [firebaseUser?.email, axiosSecure]);

  const role = mongoUser?.role || "user";

  // ---------------- INPUT ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDriverChange = (e) => {
    setDriver({ ...driver, [e.target.name]: e.target.value });
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.vehicleName || !form.model || !form.plate || !form.ownerPhone) {
      alert("⚠️ Fill all fields");
      return;
    }

    try {
      const payload = {
        ...form,
        owner: mongoUser?._id,
        driver: showDriverForm ? driver : null,
        qrData: scannedQR || null,
      };

      console.log("🚀 PAYLOAD:", payload);

      await axiosSecure.post("/api/vehicle/add", payload);

      alert("✅ Vehicle Added Successfully");

      // reset
      setForm({
        vehicleName: "",
        model: "",
        plate: "",
        ownerPhone: "",
      });

      setDriver({ name: "", phone: "" });
      setShowDriverForm(false);
      setScannedQR(null);

    } catch (err) {
      console.log(err);
      alert("❌ Failed to add vehicle");
    }
  };

  // ---------------- QR SCANNER ----------------
  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    Html5Qrcode.getCameras().then((devices) => {
      if (!devices?.length) return;

      scanner.start(
        devices[0].id,
        { fps: 10, qrbox: 250 },
        (text) => {
          scanner.stop();
          setScanning(false);

          // 🔥 FIX: extract only QR code
          const code = text.split("/").pop();
          setScannedQR(code);
        }
      );
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [scanning]);

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen flex justify-center bg-gray-100 p-5">
      <div className="w-full max-w-md space-y-4">

        <h1 className="text-center font-bold text-xl">
          Add Vehicle
        </h1>

        <form onSubmit={handleSubmit} className="bg-white p-4 rounded space-y-3">

          {/* VEHICLE */}
          <input
            name="vehicleName"
            value={form.vehicleName}
            onChange={handleChange}
            placeholder="Vehicle Name"
            className="w-full p-3 border rounded"
          />

          <input
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="Model"
            className="w-full p-3 border rounded"
          />

          <input
            name="plate"
            value={form.plate}
            onChange={handleChange}
            placeholder="Plate"
            className="w-full p-3 border rounded"
          />

          {/* ✅ OWNER PHONE FIX */}
          <input
            name="ownerPhone"
            value={form.ownerPhone}
            onChange={handleChange}
            placeholder="Owner Phone"
            className="w-full p-3 border rounded"
          />

          {/* DRIVER */}
          <button
            type="button"
            onClick={() => setShowDriverForm(!showDriverForm)}
            className="w-full bg-gray-700 text-white py-2 rounded"
          >
            {showDriverForm ? "Remove Driver" : "Add Driver"}
          </button>

          {showDriverForm && (
            <div className="space-y-2">
              <input
                name="name"
                value={driver.name}
                onChange={handleDriverChange}
                placeholder="Driver Name"
                className="w-full p-2 border"
              />

              <input
                name="phone"
                value={driver.phone}
                onChange={handleDriverChange}
                placeholder="Driver Phone"
                className="w-full p-2 border"
              />
            </div>
          )}

          {/* QR */}
          {(role === "admin" || role === "provider") && (
            <div>
              {!scanning ? (
                <button
                  type="button"
                  onClick={() => setScanning(true)}
                  className="w-full bg-yellow-400 py-2 rounded"
                >
                  Scan QR
                </button>
              ) : (
                <div id="reader"></div>
              )}

              {scannedQR && (
                <p className="text-xs text-blue-600 mt-1">
                  QR: {scannedQR}
                </p>
              )}
            </div>
          )}

          {/* SUBMIT */}
          <button className="w-full bg-green-600 text-white py-3 rounded">
            Save Vehicle
          </button>

        </form>

      </div>
    </div>
  );
};

export default AddVehiclePage;