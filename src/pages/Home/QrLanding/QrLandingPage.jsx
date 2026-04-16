import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const QrLandingPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQR = async () => {
      try {
        const res = await axiosSecure.get(`/api/qr/code/${code}`);

        const { qr, vehicle } = res.data;

        // ❌ NOT ASSIGNED → redirect
        if (!qr?.isAssigned || qr.status !== "assigned") {
          navigate("/dashboard/assign-vehicle");
          return;
        }

        // ✅ ASSIGNED → show data
        setVehicle(vehicle);

      } catch (err) {
        console.log(err);
        navigate(`/dashboard/assign-vehicle/${code}`);
      } finally {
        setLoading(false);
      }
    };

    loadQR();
  }, [code, axiosSecure, navigate]);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-5">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">
            Vehicle Contact
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            QR ID: {code}
          </p>
        </div>

        {/* OWNER */}
        <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-yellow-400">
          <h2 className="text-sm font-semibold mb-4">Owner Contact</h2>

          <a
            href={`tel:${vehicle.ownerPhone}`}
            className="block text-center py-3 rounded-xl bg-yellow-400 font-semibold"
          >
            📞 Call Owner
          </a>
        </div>

        {/* DRIVER */}
        {vehicle.driver ? (
          <div className="bg-white rounded-2xl p-5 shadow-md">
            <h2 className="text-sm font-semibold mb-4">Driver Contact</h2>

            <a
              href={`tel:${vehicle.driver.phone}`}
              className="block text-center py-3 rounded-xl bg-blue-500 text-white"
            >
              📞 Call Driver
            </a>
          </div>
        ) : (
          <p className="text-center text-gray-400">
            No driver assigned
          </p>
        )}

      </div>
    </div>
  );
};

export default QrLandingPage;