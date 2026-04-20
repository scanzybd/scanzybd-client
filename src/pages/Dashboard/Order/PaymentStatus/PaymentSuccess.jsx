import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";


const PaymentSuccess = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [params] = useSearchParams();
  const paymentId = params.get("paymentId");
  const transactionId = params.get("trxID");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // Callback must append ?paymentId=&trxID= (see bkashCallback.controller)
        if (!paymentId || !transactionId) {
          setStatus("failed");
          setLoading(false);
          return;
        }

        const { data } = await axiosSecure.post("/api/payment/confirm", {
          paymentId,
          transactionId,
        });

        if (data?.success) {
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.log(error);
        setStatus("failed");
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [paymentId, transactionId, axiosSecure]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Processing payment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md text-center space-y-4">

        <div className="text-5xl">
          {status === "success" ? "✅" : "❌"}
        </div>

        <h1
          className={`text-xl font-bold ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {status === "success"
            ? "Payment Successful"
            : "Payment Failed"}
        </h1>

        <p className="text-sm text-gray-500">
          {status === "success"
            ? "Your payment has been completed successfully."
            : "Something went wrong with your payment."}
        </p>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-green-600 text-white py-2 rounded-lg"
          >
            Home
          </button>

          <button
            onClick={() => navigate("/user/user-orders")}
            className="w-full bg-gray-200 py-2 rounded-lg"
          >
            My Orders
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccess;