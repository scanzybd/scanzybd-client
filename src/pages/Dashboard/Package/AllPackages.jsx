import React, { useEffect, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
const AllPackages = () => {
  const axiosSecure = useAxiosSecure();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axiosSecure.get("/api/package");
        setPackages(res.data.data || res.data); // controller অনুযায়ী handle
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [axiosSecure]);

  if (loading) {
    return <p className="text-center mt-10">Loading packages...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">All Packages</h1>

      {packages.length === 0 ? (
        <p>No packages found 😢</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="bg-white shadow-lg rounded-xl p-5 relative"
            >
              {/* Highlight badge */}
              {pkg.highlight && (
                <span className="absolute top-2 right-2 bg-yellow-400 text-xs px-2 py-1 rounded">
                  Popular
                </span>
              )}

              <h2 className="text-lg font-bold">{pkg.title}</h2>

              <p className="text-gray-500 text-sm mt-1">
                {pkg.description}
              </p>

              <p className="text-green-600 font-bold mt-3 text-xl">
                ৳ {pkg.price}
              </p>

              {/* Features */}
              <ul className="mt-3 text-sm text-gray-600 space-y-1">
                {pkg.features?.map((feature, index) => (
                  <li key={index}>✔ {feature}</li>
                ))}
              </ul>

              <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                Edit Package
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllPackages;