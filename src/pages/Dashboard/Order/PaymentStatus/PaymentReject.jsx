import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentReject = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const errorReason = params.get("errorMessage");

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md text-center space-y-4">

        <div className="text-5xl">❌</div>

        <h1 className="text-xl font-bold text-red-600">
          Payment Failed
        </h1>

        <p className="text-sm text-gray-500">
          {errorReason
            ? errorReason
            : "Your payment was not completed. Please try again."}
        </p>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => navigate("/user/my-cart")}
            className="w-full bg-red-600 text-white py-2 rounded-lg"
          >
            Try Again
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-200 py-2 rounded-lg"
          >
            Home
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentReject;