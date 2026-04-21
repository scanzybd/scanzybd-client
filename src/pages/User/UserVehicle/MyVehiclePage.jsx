import React, { useCallback, useEffect, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";
import {
  shellPage,
  cardSurfaceSm,
  fieldInput,
  btnPrimaryInline,
  btnSecondaryInline,
  textHeading,
  textMuted,
} from "../../../lib/uiClasses";

const MyVehiclePage = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [viewVehicle, setViewVehicle] = useState(null);
  const [editVehicle, setEditVehicle] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [qrMap, setQrMap] = useState({});

  // ---------------- LOAD USER ----------------
  useEffect(() => {
    const getUser = async () => {
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
  }, [axiosSecure]);

  const role = mongoUser?.role;

  // ---------------- LOAD VEHICLES ----------------
  const loadVehicles = useCallback(async () => {
    if (!user?.email) return;

    try {
      const res = await axiosSecure.get("/api/vehicle/my");

      const data = res.data.data || [];
      setVehicles(data);

      // ---------------- QR FETCH ----------------
      const qrIds = [...new Set(data.filter(v => v.qrData).map(v => v.qrData))];

      const qrResults = await Promise.all(
        qrIds.map(async (id) => {
          try {
            const res = await axiosSecure.get(`/api/qr/id/${id}`);
            return res.data;
          } catch {
            return null;
          }
        })
      );

      const map = {};
      qrResults.forEach((qr) => {
        if (qr?._id) map[qr._id] = qr;
      });

      setQrMap(map);
    } catch (err) {
      console.log(err);
    }
  }, [user, axiosSecure]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // ---------------- UPDATE ----------------
  const handleUpdate = async () => {
    try {
      await axiosSecure.post(`/api/vehicle/update/${editVehicle._id}`, {
        vehicleName: editVehicle.vehicleName,
        model: editVehicle.model,
        plate: editVehicle.plate,
        ownerPhone: editVehicle.ownerPhone,
        driver: editVehicle.driver,
        qrData: editVehicle.qrData,
      });

      alert("✅ Vehicle updated");
      setEditVehicle(null);
      loadVehicles();
    } catch (err) {
      console.log(err);
      alert("❌ Update failed");
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (!id) return;

    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    try {
      await axiosSecure.delete(`/api/vehicle/delete/${id}`);
      loadVehicles();
    } catch (err) {
      console.log(err);
    }
  };

  if (roleLoading) {
    return <SmartLoader fullPage label="Checking role permissions..." />;
  }

  return (
    <div className={`flex min-h-screen justify-center p-5 ${shellPage}`}>
      <div className="w-full max-w-md space-y-4">

        {/* HEADER */}
        <div className="text-center">
          <h1 className={`text-xl font-bold tracking-tight ${textHeading}`}>
            My Vehicles
          </h1>
          <p className={`text-xs ${textMuted}`}>{user?.email}</p>
        </div>

        {/* LIST */}
        {vehicles.length === 0 ? (
          <div className={`p-5 text-center shadow-sm ${cardSurfaceSm} ${textMuted}`}>
            No vehicles yet
          </div>
        ) : (
          vehicles.map((v) => {
            const qr = qrMap[v.qrData];

            return (
              <div
                key={v._id}
                className={`flex items-center justify-between gap-4 p-4 ${cardSurfaceSm}`}
              >

                {/* LEFT SIDE */}
                <div className="flex-1 space-y-1">
                  <p className={`font-bold ${textHeading}`}>{v.vehicleName}</p>

                  <p className={`text-xs ${textMuted}`}>
                    {v.model} • {v.plate}
                  </p>

                  {v.driver ? (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {v.driver.name} ({v.driver.phone})
                    </p>
                  ) : (
                    <p className={`text-xs ${textMuted}`}>
                      No driver assigned
                    </p>
                  )}

                  <p className={`text-xs ${textMuted}`}>
                    QR:{" "}
                    <span className={v.qrData ? "font-medium text-emerald-600 dark:text-emerald-400" : "font-medium text-rose-600 dark:text-rose-400"}>
                      {v.qrData ? "Assigned" : "Not assigned"}
                    </span>
                  </p>
                </div>

                {/* RIGHT SIDE - QR IMAGE */}
              <div className="flex flex-col items-center min-w-[110px]">
  {qr?.qrCode ? (
    <>
      <img
        src={qr.qrCode}
        alt="QR"
        className="w-[90px] h-[90px] rounded"
      />
      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
        {qr.code}
      </p>
    </>
  ) : v.qrData ? (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${v.qrData}`}
      alt="QR"
      className="w-[90px] h-[90px] rounded"
    />
  ) : (
    <p className={`text-xs ${textMuted}`}>No QR</p>
  )}
</div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-1">
                

                  <button
                    type="button"
                    onClick={() => setEditVehicle(v)}
                    className="rounded-lg bg-amber-600 px-2 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-600"
                  >
                    Edit
                  </button>

                  {role === "admin" && (
                    <button
                      type="button"
                      onClick={() => handleDelete(v._id)}
                      className="rounded-lg bg-rose-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}

        {/* VIEW MODAL */}
        {viewVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setViewVehicle(null)}
          >
            <div className={`w-80 rounded-xl p-4 shadow-lg ${cardSurfaceSm}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={`font-bold ${textHeading}`}>Vehicle Details</h2>
              <p className={textMuted}>{viewVehicle.vehicleName}</p>
              <p className={textMuted}>{viewVehicle.model}</p>
              <p className={textMuted}>{viewVehicle.plate}</p>

              <button
                type="button"
                onClick={() => setViewVehicle(null)}
                className={`mt-2 w-full ${btnSecondaryInline}`}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setEditVehicle(null)}
          >
            <div className={`w-80 space-y-3 p-4 shadow-lg ${cardSurfaceSm}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={`text-center font-bold ${textHeading}`}>Edit Vehicle</h2>

              <input
                value={editVehicle.vehicleName}
                onChange={(e) =>
                  setEditVehicle({ ...editVehicle, vehicleName: e.target.value })
                }
                className={fieldInput}
              />

              <input
                value={editVehicle.model}
                onChange={(e) =>
                  setEditVehicle({ ...editVehicle, model: e.target.value })
                }
                className={fieldInput}
              />

              <input
                value={editVehicle.plate}
                onChange={(e) =>
                  setEditVehicle({ ...editVehicle, plate: e.target.value })
                }
                className={fieldInput}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUpdate}
                  className={`flex-1 ${btnPrimaryInline} py-2.5`}
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => setEditVehicle(null)}
                  className={`flex-1 ${btnSecondaryInline} py-2.5`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyVehiclePage;