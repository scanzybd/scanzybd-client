import React, { useCallback, useEffect, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";

const MyVehiclePage = () => {
  const axiosSecure = useAxiosSecure();
  const { user: firebaseUser } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [viewVehicle, setViewVehicle] = useState(null);
  const [editVehicle, setEditVehicle] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);

  const [qrMap, setQrMap] = useState({});

  // ---------------- LOAD USER ----------------
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axiosSecure.get("/api/auth/me");
        setMongoUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    getUser();
  }, [axiosSecure]);

  const role = mongoUser?.role;

  // ---------------- LOAD VEHICLES ----------------
  const loadVehicles = useCallback(async () => {
    if (!firebaseUser?.email) return;

    try {
      const res = await axiosSecure.get(
        `/api/vehicle/my?email=${firebaseUser.email}`
      );

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
  }, [firebaseUser, axiosSecure]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // ---------------- UPDATE ----------------
  const handleUpdate = async () => {
    try {
      await axiosSecure.put(
        `/api/vehicle/update/${editVehicle._id}`,
        editVehicle
      );

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

  return (
    <div className="min-h-screen bg-gray-100 p-5 flex justify-center">
      <div className="w-full max-w-md space-y-4">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-xl font-bold">My Vehicles</h1>
          <p className="text-xs text-gray-500">{firebaseUser?.email}</p>
        </div>

        {/* LIST */}
        {vehicles.length === 0 ? (
          <div className="bg-white p-5 rounded-xl text-center text-gray-500">
            🚫 No vehicle found
          </div>
        ) : (
          vehicles.map((v) => {
            const qr = qrMap[v.qrData];

            return (
              <div
                key={v._id}
                className="bg-white p-4 rounded-xl shadow flex justify-between items-center gap-4"
              >

                {/* LEFT SIDE */}
                <div className="flex-1 space-y-1">
                  <p className="font-bold">🚗 {v.vehicleName}</p>

                  <p className="text-xs text-gray-500">
                    {v.model} • {v.plate}
                  </p>

                  {v.driver ? (
                    <p className="text-xs text-blue-600">
                      👨‍✈️ {v.driver.name} ({v.driver.phone})
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">
                      No driver assigned
                    </p>
                  )}

                  <p className="text-xs">
                    QR:{" "}
                    <span className={v.qrData ? "text-green-600" : "text-red-500"}>
                      {v.qrData ? "Assigned" : "Not Assigned"}
                    </span>
                  </p>
                </div>

                {/* RIGHT SIDE - QR IMAGE */}
                <div className="flex flex-col items-center min-w-[110px]">
                  {qr?.qrCode ? (
                    <>
                      <img
                        src={qr.qrCode}   // ✅ REAL QR FROM DB
                        alt="QR"
                        className="w-[90px] h-[90px] rounded"
                      />

                      <p className="text-[10px] text-gray-400 mt-1">
                        {qr.code}
                      </p>
                    </>
                  ) : (
                    <div className="text-xs text-gray-400">
                      No QR
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-1">
                

                  <button
                    onClick={() => setEditVehicle(v)}
                    className="px-2 py-1 bg-yellow-500 text-white text-xs rounded"
                  >
                    Edit
                  </button>

                  {role === "admin" && (
                    <button
                      onClick={() => handleDelete(v._id)}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded"
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center"
            onClick={() => setViewVehicle(null)}
          >
            <div className="bg-white p-4 rounded-xl w-80"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-bold">Vehicle Details</h2>
              <p>🚗 {viewVehicle.vehicleName}</p>
              <p>📌 {viewVehicle.model}</p>
              <p>🔢 {viewVehicle.plate}</p>

              <button
                onClick={() => setViewVehicle(null)}
                className="w-full bg-red-500 text-white py-1 rounded mt-2"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editVehicle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center"
            onClick={() => setEditVehicle(null)}
          >
            <div className="bg-white p-4 rounded-xl w-80 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-bold text-center">Edit Vehicle</h2>

              <input
                value={editVehicle.vehicleName}
                onChange={(e) =>
                  setEditVehicle({ ...editVehicle, vehicleName: e.target.value })
                }
                className="w-full p-2 border rounded"
              />

              <input
                value={editVehicle.model}
                onChange={(e) =>
                  setEditVehicle({ ...editVehicle, model: e.target.value })
                }
                className="w-full p-2 border rounded"
              />

              <input
                value={editVehicle.plate}
                onChange={(e) =>
                  setEditVehicle({ ...editVehicle, plate: e.target.value })
                }
                className="w-full p-2 border rounded"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="w-full bg-green-600 text-white py-1 rounded"
                >
                  Save
                </button>

                <button
                  onClick={() => setEditVehicle(null)}
                  className="w-full bg-red-500 text-white py-1 rounded"
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