import React, { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QrScanner = ({ onResult }) => {
  const [cameraId, setCameraId] = useState(null);

  useEffect(() => {
    const getCamera = async () => {
      const devices = await Html5Qrcode.getCameras();

      if (!devices || devices.length === 0) return;

      // 📱 mobile usually back camera last or environment facing
      let selectedCamera =
        devices.find((d) =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("environment")
        ) || devices[0];

      setCameraId(selectedCamera.id);
    };

    getCamera();
  }, []);

  useEffect(() => {
    if (!cameraId) return;

    const qrCodeScanner = new Html5Qrcode("reader");

    qrCodeScanner
      .start(
        cameraId,
        {
          fps: 20,
          qrbox: 250,
        },
        (decodedText) => {
          onResult(decodedText);
          qrCodeScanner.stop();
        }
      )
      .catch((err) => console.log(err));

    return () => {
      qrCodeScanner.stop().catch(() => {});
    };
  }, [cameraId, onResult]);

  return <div id="reader" className="w-full" />;
};

export default QrScanner;