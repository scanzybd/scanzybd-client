import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const QRGenerator = () => {
  const axiosSecure = useAxiosSecure();

  const [qrList, setQrList] = useState([]);
  const cardRefs = useRef({});

  const baseUrl = "https://yourdomain.com/qr";

  // 🚀 GENERATE QR (DB SAVE)
  const generateQR = async () => {
    const count = Number(document.getElementById("count").value);

    try {
      const res = await axiosSecure.post("/api/qr/generate", {
        count,
      });

      setQrList(res.data.data);
    } catch (err) {
      console.log("QR generate error:", err);
    }
  };

  // 📥 SINGLE DOWNLOAD
  const downloadCard = async (index) => {
    const node = cardRefs.current[index];

    const dataUrl = await toPng(node, {
      pixelRatio: 3,
    });

    const link = document.createElement("a");
    link.download = `qr-card-${index}.png`;
    link.href = dataUrl;
    link.click();
  };

  // 📦 DOWNLOAD ALL PDF
  const downloadAllPDF = async () => {
    const pdf = new jsPDF("p", "pt", "a4");

    for (let i = 0; i < qrList.length; i++) {
      const node = cardRefs.current[i];

      const imgData = await toPng(node, {
        pixelRatio: 3,
      });

      const imgProps = pdf.getImageProperties(imgData);

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (i !== 0) pdf.addPage();

      pdf.addImage(imgData, "PNG", 0, 20, pdfWidth, pdfHeight);
    }

    pdf.save("all-qr-cards.pdf");
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">QR Generator</h1>

      {/* INPUT */}
      <input
        type="number"
        placeholder="How many QR?"
        className="border p-2 mr-2"
        id="count"
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 mr-2"
        onClick={generateQR}
      >
        Generate
      </button>

      {/* DOWNLOAD ALL */}
      {qrList.length > 0 && (
        <button
          onClick={downloadAllPDF}
          className="bg-red-500 text-white px-4 py-2"
        >
          Download All (PDF)
        </button>
      )}

      {/* LIST */}
      <div className="grid grid-cols-4 gap-4 justify-items-center mt-5">
        {qrList.map((item, index) => (
          <div key={item._id || index}>

            {/* CARD */}
            <div
              ref={(el) => (cardRefs.current[index] = el)}
              style={{
                width: "3in",
                height: "4in",
                borderRadius: "20px",
                padding: "10px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >

              {/* YELLOW CARD */}
              <div
                style={{
                  width: "100%",
                  height: "3.5in",
                  backgroundColor: "#FFED29",
                  borderRadius: "18px",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >

                {/* WHITE CARD */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "white",
                    borderRadius: "14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                    position: "relative",
                  }}
                >

                  <div style={{ fontSize: "17px", fontWeight: "bold" }}>
                    QR Tag
                  </div>

                  <img
                    src={item.qrCode}
                    style={{ width: "2in", height: "2in" }}
                  />

                  <div style={{ fontSize: "14px" }}>
                    qrtag.com
                  </div>

                </div>

                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#2596be",
                    textAlign: "center",
                    marginTop: "8px",
                  }}
                >
                  SCAN TO CONTACT OWNER
                </div>
              </div>

              {/* SERIAL */}
              <div style={{ marginTop: "10px" }}>
                {item.code}
              </div>
            </div>

            {/* DOWNLOAD */}
            <button
              onClick={() => downloadCard(index)}
              className="bg-green-500 text-white px-2 py-1 mt-2 w-full"
            >
              Download
            </button>

          </div>
        ))}
      </div>
    </div>
  );
};

export default QRGenerator;