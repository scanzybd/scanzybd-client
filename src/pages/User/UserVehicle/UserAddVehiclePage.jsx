import React, { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";

import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";
import AddVehicleForm from "../../../components/AddVehicleForm";
import {
  shellPage,
  cardSurfaceSm,
  btnPrimary,
  textHeading,
  textMuted,
} from "../../../lib/uiClasses";
import useTagTypes from "../../../hooks/useTagTypes";
import { isCycleTagType } from "../../../lib/tagTypeUtils";
import {
  createEmptyVehicleForm,
  buildVehicleAddPayload,
  validateVehicleForm,
} from "../../../lib/vehicleFormUtils";

const UserAddVehiclePage = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [mongoUser, setMongoUser] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [form, setForm] = useState(createEmptyVehicleForm);
  const { data: tagTypes = [] } = useTagTypes();

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
      } catch {
        /* profile load failed */
      } finally {
        setRoleLoading(false);
      }
    };

    getUser();
  }, [user?.email, axiosSecure]);

  const role = mongoUser?.role || "user";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateVehicleForm(
      form,
      isCycleTagType(form.tagType, tagTypes)
    );
    if (validationError) {
      alert(validationError);
      return;
    }

    if (!mongoUser?._id) {
      alert("Sign in required. Your profile could not be loaded.");
      return;
    }

    try {
      const payload = {
        ...buildVehicleAddPayload(form, isCycleTagType(form.tagType, tagTypes)),
        owner: mongoUser._id,
        qrData: scannedQR || null,
      };

      await axiosSecure.post("/api/vehicle/add", payload);

      alert("Vehicle added successfully.");

      setForm(createEmptyVehicleForm());
      setScannedQR(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add vehicle.");
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

  if (role === "user") {
    return <Navigate to="/user/my-vehiclePage" replace />;
  }

  return (
    <div className={`flex min-h-screen justify-center p-5 ${shellPage}`}>
      <div className="w-full max-w-md space-y-4">
        <h1 className={`text-center text-xl font-bold tracking-tight ${textHeading}`}>
          Add Vehicle
        </h1>

        <form onSubmit={handleSubmit} className={`space-y-4 p-4 ${cardSurfaceSm}`}>
          <AddVehicleForm
            form={form}
            onPatch={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          />

          {(role === "admin" || role === "provider") && (
            <div>
              {!scanning ? (
                <button
                  type="button"
                  onClick={() => setScanning(true)}
                  className={btnPrimary}
                >
                  Scan QR
                </button>
              ) : (
                <div id="reader" />
              )}

              {scannedQR && (
                <p className={`mt-2 text-xs ${textMuted}`}>QR: {scannedQR}</p>
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
