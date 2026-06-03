import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

/** Parse scanned text or QR landing URL into assignable code. */
export function extractQrCodeFromScan(raw) {
  const text = String(raw || "").trim();
  if (!text) return "";

  if (/^https?:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      const segments = url.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1] || "";
      if (last && last !== "qr-landing") return decodeURIComponent(last);
    } catch {
      /* fall through */
    }
  }

  const tail = text.split("/").filter(Boolean).pop() || text;
  return decodeURIComponent(tail).trim();
}

/** Dynamic scan region — small fixed qrbox often fails on phones. */
export function buildQrScanConfig() {
  return {
    fps: 15,
    qrbox: (viewfinderWidth, viewfinderHeight) => {
      const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
      const edge = Math.floor(Math.min(320, Math.max(220, minEdge * 0.82)));
      return { width: edge, height: edge };
    },
    disableFlip: false,
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true,
    },
    formatsToSupport: [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.DATA_MATRIX,
    ],
  };
}

const BENIGN_SCAN_ERRORS = [
  "No MultiFormat Readers",
  "No barcode or QR code detected",
  "NotFoundException",
];

export function isBenignScanError(message) {
  const msg = String(message || "");
  return BENIGN_SCAN_ERRORS.some((bit) => msg.includes(bit));
}

export async function pickRearCameraId() {
  const devices = await Html5Qrcode.getCameras();
  if (!devices?.length) return null;
  const preferred =
    devices.find((d) => {
      const label = (d.label || "").toLowerCase();
      return (
        label.includes("back") ||
        label.includes("rear") ||
        label.includes("environment") ||
        label.includes("wide")
      );
    }) || devices[devices.length - 1];
  return preferred?.id || devices[0]?.id || null;
}

/**
 * Start scanner with environment camera first, then device id fallback.
 */
export async function startQrScanner(elementId, { onSuccess, onError } = {}) {
  const scanner = new Html5Qrcode(elementId);
  const config = buildQrScanConfig();

  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
  await new Promise((resolve) => setTimeout(resolve, 400));

  const wrappedSuccess = (decodedText, decodedResult) => {
    onSuccess?.(decodedText, decodedResult, scanner);
  };

  const wrappedError = (error) => {
    if (!isBenignScanError(error)) onError?.(error, scanner);
  };

  try {
    await scanner.start(
      { facingMode: "environment" },
      config,
      wrappedSuccess,
      wrappedError
    );
    return scanner;
  } catch (envErr) {
    const cameraId = await pickRearCameraId();
    if (!cameraId) throw envErr;
    await scanner.start(cameraId, config, wrappedSuccess, wrappedError);
    return scanner;
  }
}
