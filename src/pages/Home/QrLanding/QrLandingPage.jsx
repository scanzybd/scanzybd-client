import React from "react";
import { useParams } from "react-router-dom";

const QrLandingPage = () => {
  const { code } = useParams();

  const data = {
    ownerPhone: "8801XXXXXXXXX",
    driverPhone: "8801YYYYYYYYY",
    driverEnabled: true,
  };

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

        {/* 🟡 OWNER CARD (highlighted) */}
        <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-yellow-400">

          <h2 className="text-sm font-semibold text-gray-800 mb-4">
            Owner Contact
          </h2>

          <div className="space-y-3">

            <a
              href={`tel:${data.ownerPhone}`}
              className="block text-center py-3 rounded-xl bg-yellow-400 text-black font-semibold shadow hover:scale-[1.02] transition"
            >
              📞 Call Owner
            </a>

            <a
              href={`sms:${data.ownerPhone}`}
              className="block text-center py-3 rounded-xl bg-gray-900 text-white font-medium hover:scale-[1.02] transition"
            >
              💬 Message Owner
            </a>

          </div>
        </div>

        {/* DRIVER CARD */}
        <div
          className={`bg-white rounded-2xl p-5 shadow-md border ${
            !data.driverEnabled ? "opacity-60" : "border-gray-200"
          }`}
        >

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-800">
              Driver Contact
            </h2>

            {!data.driverEnabled && (
              <span className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded-full">
                Disabled
              </span>
            )}
          </div>

          {data.driverEnabled ? (
            <div className="space-y-3">

              <a
                href={`tel:${data.driverPhone}`}
                className="block text-center py-3 rounded-xl bg-blue-500 text-white font-semibold shadow hover:scale-[1.02] transition"
              >
                📞 Call Driver
              </a>

              <a
                href={`sms:${data.driverPhone}`}
                className="block text-center py-3 rounded-xl bg-green-500 text-white font-semibold shadow hover:scale-[1.02] transition"
              >
                💬 Message Driver
              </a>

            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center">
              Driver contact is disabled by owner
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default QrLandingPage;