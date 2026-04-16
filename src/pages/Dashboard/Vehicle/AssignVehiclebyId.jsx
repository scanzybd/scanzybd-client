import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxiosSecure from "../../..//hooks/useAxiosSecure";

const AssignVehiclebyId = () => {
  const { code } = useParams(); // 🔥 QR code from URL
  const axiosSecure = useAxiosSecure();

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");

  // 🚗 load vehicles
  useEffect(() => {
  const loadVehicles = async () => {
    try {
      const res = await axiosSecure.get("/api/vehicle");

      // ✅ only unassigned vehicles
      const available = (res.data.data || []).filter(
        (v) => !v.qrData
      );

      setVehicles(available);

    } catch (err) {
      console.log(err);
    }
  };

  loadVehicles();
}, [axiosSecure]);

  // ✅ assign
  const handleAssign = async () => {
  try {
    console.log({ code, selectedVehicle });

    if (!code || !selectedVehicle) {
      return alert("Missing data");
    }

    await axiosSecure.post("/api/qr/assign", {
      code,
      vehicleId: selectedVehicle,
    });

    alert("Assigned successfully");
  } catch (err) {
    console.log(err);
  }
};

  return (
    <div className="p-5 max-w-md mx-auto">

      <h1 className="text-xl font-bold mb-4">
        Assign Vehicle
      </h1>

      {/* QR CODE */}
      <p className="text-sm text-gray-500 mb-3">
        QR: <span className="font-semibold">{code}</span>
      </p>

      {/* VEHICLE SELECT */}
      <select
        value={selectedVehicle}
        onChange={(e) => setSelectedVehicle(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      >
        <option value="">Select Vehicle</option>

        {vehicles.map((v) => (
          <option key={v._id} value={v._id}>
            {v.vehicleName} ({v.plate})
          </option>
        ))}
      </select>

      {/* BUTTON */}
      <button
        onClick={handleAssign}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Assign Vehicle
      </button>

    </div>
  );
};

export default AssignVehiclebyId;