import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";
import {
  shellPage,
  cardSurfaceSm,
  fieldInput,
  btnPrimary,
  textHeading,
  textMuted,
} from "../../../lib/uiClasses";

const UserAddVehiclePage = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [mongoUser, setMongoUser] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [form, setForm] = useState({
    vehicleName: "",
    model: "",
    plate: "",
    ownerPhone: ""
  });

  const [driver, setDriver] = useState({
    name: "",
    phone: "",
  });

  const [showDriverForm, setShowDriverForm] = useState(false);

  const [scanning, setScanning] = useState(false);
  const [scannedQR, setScannedQR] = useState(null);

  const scannerRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      if (!user?.email) {
        setRoleLoading(false);
        return;
      }

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
  }, [user?.email, axiosSecure]);

  const role = mongoUser?.role || "user";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDriverChange = (e) => {
    setDriver({ ...driver, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.vehicleName || !form.model || !form.plate || !form.ownerPhone) {
      alert("⚠️ Fill all fields");
      return;
    }

    if (!mongoUser?._id) {
      alert("⚠️ Sign in required. Your profile could not be loaded.");
      return;
    }

    try {
      const payload = {
        ...form,
        owner: mongoUser._id,
        driver: showDriverForm ? driver : null,
        qrData: scannedQR || null,
      };

      await axiosSecure.post("/api/vehicle/add", payload);

      alert("✅ Vehicle Added Successfully");

      setForm({ vehicleName: "", model: "", plate: "" ,ownerPhone:""});
      setDriver({ name: "", phone: "" });
      setShowDriverForm(false);
      setScannedQR(null);
    } catch (err) {
      console.log(err);
      alert("❌ Failed to add vehicle");
    }
  };

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
          setScannedQR(text);
        }
      );
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [scanning]);

  if (roleLoading) {
    return <SmartLoader fullPage label="Checking role permissions..." />;
  }

  return (
    <div className={`flex min-h-screen justify-center p-5 ${shellPage}`}>
      <div className="w-full max-w-md space-y-4">

        <h1 className={`text-center text-xl font-bold tracking-tight ${textHeading}`}>
          Add Vehicle
        </h1>

        <form onSubmit={handleSubmit} className={`space-y-3 p-4 ${cardSurfaceSm}`}>

          <input
            name="vehicleName"
            value={form.vehicleName}
            onChange={handleChange}
            placeholder="Vehicle Name"
            className={fieldInput}
          />

          <input
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="Model"
            className={fieldInput}
          />

          <input
            name="plate"
            value={form.plate}
            onChange={handleChange}
            placeholder="Plate"
            className={fieldInput}
          />
          <input
            name="ownerPhone"
            value={form.ownerPhone}
            onChange={handleChange}
            placeholder="Owner Number"
            className={fieldInput}
          />

          <button
            type="button"
            onClick={() => setShowDriverForm(!showDriverForm)}
            className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 font-semibold text-slate-800 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {showDriverForm ? "Remove Driver" : "Add Driver (optional)"}
          </button>

          {showDriverForm && (
            <div className="space-y-2">
              <input
                name="name"
                value={driver.name}
                onChange={handleDriverChange}
                placeholder="Driver Name"
                className={fieldInput}
              />

              <input
                name="phone"
                value={driver.phone}
                onChange={handleDriverChange}
                placeholder="Phone"
                className={fieldInput}
              />
            </div>
          )}

          {(role === "admin" || role === "provider") && (
            <div>
              {!scanning ? (
                <button
                  type="button"
                  onClick={() => setScanning(true)}
                  className={`${btnPrimary}`}
                >
                  Scan QR
                </button>
              ) : (
                <div id="reader"></div>
              )}

              {scannedQR && (
                <p className={`mt-2 text-xs ${textMuted}`}>
                  QR: {scannedQR}
                </p>
              )}
            </div>
          )}

          <button type="submit" className={btnPrimary}>
            Save Vehicle
          </button>
        </form>

      </div>
    </div>
  );
};

export default UserAddVehiclePage;
