import React from "react";

const Error404 = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">

      {/* Image */}
      <img
        src="/path-to-your-image.png" // Replace with your uploaded image path or URL
        alt="Error 404"
        className="w-48 h-48 mb-6"
      />

      {/* Error Text */}
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Error 404</h1>
      <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>

      {/* Go Home Button */}
      <a
        href="/"
        className="px-6 py-3 bg-lime-300 text-black rounded-lg font-semibold hover:bg-lime-200 transition"
      >
        Go Home
      </a>
    </div>
  );
};

export default Error404;
