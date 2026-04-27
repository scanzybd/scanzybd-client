import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { ScanLine, Camera } from "lucide-react";

const extractQrCode = (raw) => {
  const text = String(raw || "").trim();
  if (!text) return "";

  // If scanner returns a URL, take the last non-empty path segment as code.
  if (/^https?:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      const segments = url.pathname.split("/").filter(Boolean);
      return decodeURIComponent(segments[segments.length - 1] || "");
    } catch {
      // fallback to non-URL handling below
    }
  }

  return decodeURIComponent(text.split("/").filter(Boolean).pop() || text);
};

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

    const scanner = new Html5Qrcode("scan-assign-reader");
    scannerRef.current = scanner;

    Html5Qrcode.getCameras().then((devices) => {
      if (!devices?.length) return;

      // Prefer rear/environment camera for faster and more stable QR detection.
      const preferred =
        devices.find(
          (d) =>
            d.label?.toLowerCase().includes("back") ||
            d.label?.toLowerCase().includes("rear") ||
            d.label?.toLowerCase().includes("environment")
        ) || devices[0];
      const cameraId = preferred.id;

      scanner
        .start(
          cameraId,
          {
            fps: 20,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1,
            disableFlip: true,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          },
          (decodedText) => {
            handleStop(scanner);
            const qrCode = extractQrCode(decodedText);
            if (!qrCode) return;
            navigate(`/dashboard/assign-vehicle/${encodeURIComponent(qrCode)}`);
          }
        )
        .catch((err) => console.log(err));
    });

    return () => {
      handleStop(scannerRef.current);
    };
  }, [scanning, navigate]);

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 border-b border-slate-200/90 pb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          <Camera className="h-3.5 w-3.5" />
          Scanner
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Scan QR code
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Point the camera at a code. You will be redirected to the decoded link.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        {!scanning && (
          <button
            type="button"
            onClick={() => setScanning(true)}
            className="btn btn-block gap-2 rounded-xl border-0 bg-emerald-500 py-6 text-lg font-semibold text-white hover:bg-emerald-600"
          >
            <ScanLine className="h-6 w-6" />
            Start camera
          </button>
        )}

        {scanning && (
          <div className="overflow-hidden rounded-xl bg-black">
            <div id="scan-assign-reader" className="min-h-[260px]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanAssignPage;
