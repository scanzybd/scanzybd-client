import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";


const ScanAssignPage = () => {
  const [scanning, setScanning] = useState(false);

  const scannerRef = useRef(null);
  const navigate = useNavigate();

  const handleStop = async (scanner) => {
    try {
      if (scanner) {
        await scanner.stop();
        scanner.clear();
      }
    } catch {
      console.log("stop ignored");
    }
  };

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    Html5Qrcode.getCameras().then((devices) => {
      if (!devices?.length) return;

      const cameraId = devices[0].id;

      scanner
        .start(
          cameraId,
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            handleStop(scanner);

            // 🔥 IMPORTANT: NAVIGATE HERE
            navigate(decodedText); 
            // example QR: "/vehicle/V123" or full URL
          }
        )
        .catch((err) => console.log(err));
    });

    return () => {
      handleStop(scannerRef.current);
    };
  }, [scanning, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center">

      <div className="w-full max-w-md space-y-5">

        {/* HEADER */}
        <h1 className="text-center text-xl font-bold">
          Scan QR Code
        </h1>

        {/* BUTTON */}
        {!scanning && (
          <button
            onClick={() => setScanning(true)}
            className="w-full py-4 bg-yellow-400 font-bold rounded-2xl"
          >
            📷 Start Scan
          </button>
        )}

        {/* CAMERA */}
        {scanning && (
          <div className="bg-black rounded-2xl overflow-hidden">
            <div id="reader" />
          </div>
        )}

      </div>
    </div>
  );
};

export default ScanAssignPage;