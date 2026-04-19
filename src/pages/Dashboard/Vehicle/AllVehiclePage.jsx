import React, { useCallback, useEffect, useMemo, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";

const AllVehiclePage = () => {
  const axiosSecure = useAxiosSecure();
  const { user: firebaseUser } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [mongoUser, setMongoUser] = useState(null);
  const [qrMap, setQrMap] = useState({});
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

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

  // ---------------- LOAD ALL VEHICLES (ADMIN) ----------------
  const loadVehicles = useCallback(async () => {
    setLoading(true);

    try {
      // 🔥 IMPORTANT: ADMIN SHOULD USE ALL VEHICLES API
      const res = await axiosSecure.get("/api/vehicle");

      const data = res.data.data || [];
      setVehicles(data);

      // ---------------- QR IDS ----------------
      const qrIds = [...new Set(data.map(v => v.qrData).filter(Boolean))];

      if (qrIds.length > 0) {
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
      }

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // ---------------- FILTER (FAST CLIENT SIDE) ----------------
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) =>
      `${v.vehicleName} ${v.model} ${v.plate}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [vehicles, search]);

  return (
    <div className="min-h-screen bg-gray-100 p-5 flex justify-center">
      <div className="w-full max-w-3xl space-y-4">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-xl font-bold">All Vehicles (Admin)</h1>
          <p className="text-xs text-gray-500">{firebaseUser?.email}</p>
        </div>

        {/* SEARCH */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vehicle / plate..."
          className="w-full p-2 border rounded"
        />

        {/* LOADING */}
        {loading && <SmartLoader label="Loading vehicles..." />}

        {/* LIST */}
        {!loading && filteredVehicles.length === 0 && (
          <div className="bg-white p-5 rounded-xl text-center text-gray-500">
            🚫 No vehicle found
          </div>
        )}

        {filteredVehicles.map((v) => {
          const qr = qrMap[v.qrData];

          return (
            <div
              key={v._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between gap-4"
            >

              {/* LEFT */}
              <div className="flex-1 space-y-1">
                <p className="font-bold">🚗 {v.vehicleName}</p>

                <p className="text-xs text-gray-500">
                  {v.model} • {v.plate}
                </p>

                {/* OWNER (ADMIN VIEW) */}
                <p className="text-[11px] text-purple-600 uppercase">
                  👤 Owner: {v.owner?.name || "N/A"} 
                </p>
                <p className="text-[11px]">
                  👤 Email: {v.owner?.email}
                </p>

                {/* DRIVER */}
                {v.driver ? (
                  <p className="text-xs text-blue-600">
                    👨‍✈️ {v.driver.name} ({v.driver.phone})
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">No driver</p>
                )}

                {/* QR STATUS */}
                <p className="text-xs">
                  QR:{" "}
                  <span className={v.qrData ? "text-green-600" : "text-red-500"}>
                    {v.qrData ? "Assigned" : "Not Assigned"}
                  </span>
                </p>
              </div>

              {/* RIGHT QR */}
              <div className="flex flex-col items-center min-w-[110px]">
                {qr?.qrCode ? (
                  <>
                  
                    <img
                      src={qr.qrCode}
                      alt="QR"
                      className="w-[90px] h-[90px] rounded"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      {qr.code}
                    </p>
                  </>
                ) : v.qrData ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${v.qrData}`}
                    alt="QR"
                  />
                ) : (
                  <p className="text-xs text-gray-400">No QR</p>
                )}
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
};

export default AllVehiclePage;