import React, { useEffect, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";

const MyVehiclePage = () => {
  const axiosSecure = useAxiosSecure();
  const { user: firebaseUser } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [viewVehicle, setViewVehicle] = useState(null);
  const [editVehicle, setEditVehicle] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);


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
}, []);

const role = mongoUser?.role;


  // ---------------- LOAD VEHICLES ----------------
  const loadVehicles = async () => {
    try {
      const res = await axiosSecure.get(
        `/api/vehicle/my?email=${firebaseUser?.email}`
      );
      setVehicles(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (firebaseUser?.email) {
      loadVehicles();
    }
  }, [firebaseUser?.email]);

  // ---------------- UPDATE (LOCAL ONLY) ----------------
 const handleUpdate = async () => {
  try {
    await axiosSecure.put(
      `/api/vehicle/update/${editVehicle._id}`,
      editVehicle
    );

    loadVehicles(); // reload from server
    setEditVehicle(null);
  } catch (err) {
    console.log(err);
    alert("❌ Update failed");
  }
};

const handleDelete = async (id) => {
  if (!id) {
    console.log("❌ Missing vehicle id");
    return;
  }

  const confirm = window.confirm("Are you sure?");

  if (!confirm) return;

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
          <p className="text-xs text-gray-500">
            {firebaseUser?.email}
          </p>
        </div>

        {/* EMPTY */}
        {vehicles.length === 0 ? (
          <div className="bg-white p-5 rounded-xl text-center text-gray-500">
            🚫 No vehicle found
          </div>
        ) : (
          vehicles.map((v) => (
            <div
              key={v._id}
              className="bg-white p-4 rounded-xl shadow space-y-2"
            >
              {/* INFO */}
              <div>
                <p className="font-bold">🚗 {v.vehicleName}</p>
                <p className="text-xs text-gray-500">
                  {v.model} • {v.plate}
                </p>
              </div>

              {/* DRIVER */}
              {v.driver ? (
                <p className="text-xs text-blue-600">
                  👨‍✈️ {v.driver.name} ({v.driver.phone})
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  No driver assigned
                </p>
              )}

              {/* QR */}
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full text-white ${
                  v.qrData ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {v.qrData ? "QR Assigned" : "Not Assigned"}
              </span>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-2">
  <button
    onClick={() => setViewVehicle(v)}
    className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md"
  >
    View
  </button>

  <button
    onClick={() => setEditVehicle(v)}
    className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-md"
  >
    Edit
  </button>

  {/* 🔥 ONLY ADMIN CAN DELETE */}
  {role === "admin" && (
    <button
      onClick={() => handleDelete(v._id)}
      className="px-3 py-1 bg-red-600 text-white text-xs rounded-md"
    >
      Delete
    </button>
  )}
</div>
            </div>
          ))
        )}

        {/* VIEW MODAL */}
        {viewVehicle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-xl w-80 space-y-2">

              <h2 className="font-bold">Vehicle Details</h2>

              <p>🚗 {viewVehicle.vehicleName}</p>
              <p>📌 {viewVehicle.model}</p>
              <p>🔢 {viewVehicle.plate}</p>

              {viewVehicle.driver && (
                <p className="text-blue-600 text-sm">
                  👨‍✈️ {viewVehicle.driver.name}
                </p>
              )}

              <button
                onClick={() => setViewVehicle(null)}
                className="w-full bg-red-500 text-white py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editVehicle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-xl w-80 space-y-3">

              <h2 className="font-bold text-center">Edit Vehicle</h2>

              <input
                value={editVehicle.vehicleName}
                onChange={(e) =>
                  setEditVehicle({
                    ...editVehicle,
                    vehicleName: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />

              <input
                value={editVehicle.model}
                onChange={(e) =>
                  setEditVehicle({
                    ...editVehicle,
                    model: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />

              <input
                value={editVehicle.plate}
                onChange={(e) =>
                  setEditVehicle({
                    ...editVehicle,
                    plate: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />

              <input
                value={editVehicle.driver?.name || ""}
                onChange={(e) =>
                  setEditVehicle({
                    ...editVehicle,
                    driver: {
                      ...editVehicle.driver,
                      name: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded"
              />

              <input
                value={editVehicle.driver?.phone || ""}
                onChange={(e) =>
                  setEditVehicle({
                    ...editVehicle,
                    driver: {
                      ...editVehicle.driver,
                      phone: e.target.value,
                    },
                  })
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