import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const mockVehicles = [
  { id: "V123", name: "Toyota Corolla" },
  { id: "V124", name: "Honda Civic" },
  { id: "V125", name: "Nissan GTR" },
];

const AssignVehiclePage = () => {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // QR theke vehicleId ashte pare
  const queryParams = new URLSearchParams(location.search);
  const qrVehicleId = queryParams.get("vehicleId");

  useEffect(() => {
    if (search === "") {
      setFiltered(mockVehicles);
    } else {
      const result = mockVehicles.filter((v) =>
        v.name.toLowerCase().includes(search.toLowerCase())
      );
      setFiltered(result);
    }
  }, [search]);

  const handleAssign = (vehicle) => {
    setSelectedVehicle(vehicle);

    // 🔥 here you will call backend API
    setTimeout(() => {
      alert(`Vehicle Assigned: ${vehicle.name}`);

      // redirect to vehicle page
      navigate(`/vehicle/${vehicle.id}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5 flex justify-center">
      <div className="w-full max-w-md space-y-4">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-xl font-bold">
            Add Vehicle
          </h1>

          {qrVehicleId && (
            <p className="text-xs text-gray-500">
              QR Vehicle ID: {qrVehicleId}
            </p>
          )}
        </div>

        {/* SEARCH */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vehicle..."
          className="w-full p-3 rounded-xl border"
        />

        {/* LIST */}
        <div className="space-y-2">
          {filtered.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white p-3 rounded-xl flex justify-between items-center shadow"
            >
              <div>
                <p className="font-semibold">{vehicle.name}</p>
                <p className="text-xs text-gray-500">{vehicle.id}</p>
              </div>

              <button
                onClick={() => handleAssign(vehicle)}
                className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm"
              >
                Assign
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AssignVehiclePage;