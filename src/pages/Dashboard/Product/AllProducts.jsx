import React, { useEffect, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";



const AllProducts = () => {
  const axiosSecure = useAxiosSecure();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosSecure.get("/api/products");
        setProducts(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [axiosSecure]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">All Products</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products found 😢</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white shadow rounded-xl p-4"
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-40 object-cover rounded"
              />

              <p className="text-xs text-gray-500 mt-2">
                {product.type}
              </p>

              <h2 className="text-lg font-bold">{product.title}</h2>

              <p className="text-sm text-gray-600">
                {product.packInfo}
              </p>

              <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                {product.description}
              </p>

              <p className="text-green-600 font-bold mt-2">
                ৳ {product.price}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Added by: {product?.createdBy?.name || "Unknown"}
              </p>

              <button className="mt-3 w-full bg-yellow-400 py-2 rounded">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllProducts;