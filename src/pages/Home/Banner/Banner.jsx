import React from 'react';

const Banner = () => {
    return (
         <div className="min-h-screen bg-yellow-50 flex flex-col">

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-1 text-center px-4">

        <h1 className="text-3xl md:text-5xl font-bold text-gray-800">
          Scan. Connect. Instantly.
        </h1>

        <p className="mt-3 text-gray-600 max-w-md">
          QR based smart system for Vehicle Owner, Student ID & Pet Tag tracking.
        </p>

        <button className="mt-6 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-xl shadow-md transition">
          Scan QR
        </button>
      </div>

     

    </div>
    );
};

export default Banner;