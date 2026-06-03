import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ScanLine, Camera, Car, Keyboard, X } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { buildAssignConfirmUrl } from "../../../lib/orderFulfillmentUtils";
import {
  extractQrCodeFromScan,
  startQrScanner,
} from "../../../lib/qrScannerConfig";

const ScanAssignPage = () => {
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [showManual, setShowManual] = useState(false);
  const scannedRef = useRef(false);
  const scannerRef = useRef(null);

  const [searchParams] = useSearchParams();
  const presetVehicleId = searchParams.get("vehicleId") || "";
  const returnTo = searchParams.get("returnTo") || "";

  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const { data: presetVehicle } = useQuery({
    queryKey: ["vehicle", "preset", presetVehicleId],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/vehicle");
      const list = res.data?.data || [];
      return list.find((v) => String(v._id) === String(presetVehicleId)) || null;
    },
    enabled: Boolean(presetVehicleId),
    staleTime: 30_000,
  });

  const goToAssign = useCallback(
    (raw) => {
      if (scannedRef.current) return;
      const qrCode = extractQrCodeFromScan(raw);
      if (!qrCode) {
        setCameraError("Could not read a QR code. Try manual entry or better lighting.");
        return;
      }
      scannedRef.current = true;
      navigate(
        buildAssignConfirmUrl(qrCode, presetVehicleId || undefined, returnTo || undefined)
      );
    },
    [navigate, presetVehicleId, returnTo]
  );

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
      scanner.clear();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!scanning) return undefined;

    scannedRef.current = false;
    setCameraError("");

    let cancelled = false;

    (async () => {
      try {
        const scanner = await startQrScanner("scan-assign-reader", {
          onSuccess: (decodedText) => {
            if (cancelled) return;
            stopScanner();
            setScanning(false);
            goToAssign(decodedText);
          },
          onError: (err) => {
            if (cancelled) return;
            setCameraError(String(err?.message || err || "Camera error"));
          },
        });
        if (cancelled) {
          await stopScanner();
          return;
        }
        scannerRef.current = scanner;
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setCameraError(
            err?.message?.includes("NotAllowed")
              ? "Camera permission denied. Allow camera in browser settings, or enter code manually."
              : err?.message ||
                  "Could not start camera. Use HTTPS, try another browser, or enter code manually."
          );
          setScanning(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [scanning, goToAssign, stopScanner]);

  const handleStopClick = () => {
    stopScanner();
    setScanning(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    goToAssign(code);
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 border-b border-slate-200/90 pb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          <Camera className="h-3.5 w-3.5" />
          Scanner
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Scan QR code
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Hold the code inside the box, 20–30 cm away, with good light. Keep steady for 1–2 seconds.
        </p>
      </div>

      {presetVehicleId && presetVehicle ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
          <Car className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
              Assigning to order vehicle
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
              {presetVehicle.plate}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {presetVehicle.vehicleName}
            </p>
          </div>
        </div>
      ) : null}

      {cameraError ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {cameraError}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-6">
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
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-xl bg-black">
              <div id="scan-assign-reader" className="min-h-[min(70vw,320px)] w-full" />
            </div>
            <button
              type="button"
              onClick={handleStopClick}
              className="btn btn-sm btn-outline w-full gap-1.5 rounded-xl"
            >
              <X className="h-4 w-4" />
              Stop camera
            </button>
          </div>
        )}

        <div className="mt-4 border-t border-slate-100 pt-4">
          <button
            type="button"
            className="btn btn-ghost btn-sm w-full gap-1.5 text-slate-600"
            onClick={() => setShowManual((v) => !v)}
          >
            <Keyboard className="h-4 w-4" />
            {showManual ? "Hide manual entry" : "Enter QR code manually"}
          </button>

          {showManual ? (
            <form onSubmit={handleManualSubmit} className="mt-3 space-y-2">
              <input
                type="text"
                className="input input-bordered w-full rounded-xl font-mono text-sm"
                placeholder="Paste code or full scanzybd.com link"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                autoComplete="off"
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm w-full rounded-xl"
                disabled={!manualCode.trim()}
              >
                Continue with this code
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-slate-500">
        <li>Use Chrome or Safari on phone; site must be HTTPS (not plain HTTP).</li>
        <li>If scan fails: increase brightness, wipe camera lens, try manual entry.</li>
        <li>Printed QR should be at least 2×2 cm for reliable scanning.</li>
      </ul>
    </div>
  );
};

export default ScanAssignPage;
