import React, { useEffect, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const AllQR = () => {
    const axiosSecure = useAxiosSecure();

    const [qrCodes, setQrCodes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQR = async () => {
            try {
                const res = await axiosSecure.get("/api/qr/allQR");

                // ✅ backend returns array directly
                setQrCodes(res.data);

            } catch (error) {
                console.error("Error fetching QR codes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQR();
    }, [axiosSecure]);

    if (loading) return <p>Loading QR Codes...</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h1>All QR Codes {qrCodes.length}</h1>

            {qrCodes.length === 0 ? (
                <p>No QR codes found</p>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px"
                }}>
                    {qrCodes.map((qr) => (
                        <div
                            key={qr._id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "10px",
                                padding: "15px",
                                textAlign: "center",
                                justifyContent: "center",
                                alignItems: "center",
                                display: "flex",
                                flexDirection: "column"
                            }}
                        >
                            <img
                                src={qr.qrCode}
                                alt="QR Code"
                                style={{
                                    width: "140px",
                                    height: "140px",
                                    marginBottom: "10px"
                                }}
                            />

                            <p><strong>{qr.code}</strong></p>

                            <p style={{
                                color: qr.status === "assigned" ? "green" : "orange",
                                fontWeight: "bold"
                            }}>
                                {qr.status}
                            </p>

                            <p>Scans: {qr.scanCount}</p>

                            <a
                                href={qr.qrLink}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: "12px" }}
                            >
                                Open QR Link
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllQR;