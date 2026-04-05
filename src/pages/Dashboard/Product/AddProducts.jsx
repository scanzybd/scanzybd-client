import React, { useState } from "react";
import useAuth from "../../../hooks/useAuth"; // assuming you have this
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const productTypes = [
  "Car Tag",
  "Bike Tag",
  "Helmet Tag",
  "Pack of 1",
  "Pack of 2",
  "Starter Pack",
];

const AddProducts = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth(); // firebase user

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
    type: "",
    packInfo: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        ...form,
        price: Number(form.price),

        // 🔥 creator info add
        createdBy: {
          name: user?.displayName,
          email: user?.email,
          uid: user?.uid,
        },

        createdAt: new Date(),
      };

      const res = await axiosSecure.post("/api/products", productData);
      console.log(res)

      alert("Product Added Successfully 🔥");

      setForm({
        title: "",
        description: "",
        price: "",
        image: "",
        type: "",
        packInfo: "",
      });
    } catch (err) {
      console.log(err);
      alert("Failed to add product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex justify-center">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">
        
        {/* FORM */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">Add New Product</h2>

          <input
            name="title"
            placeholder="Product Title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 border rounded mb-3"
          />

          <input
            name="price"
            placeholder="Price (e.g. 499)"
            value={form.price}
            onChange={handleChange}
            className="w-full p-3 border rounded mb-3"
          />

          <input
            name="image"
            placeholder="Image URL"
            value={form.image}
            onChange={handleChange}
            className="w-full p-3 border rounded mb-3"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-3 border rounded mb-3"
          >
            <option value="">Select Product Type</option>
            {productTypes.map((t, idx) => (
              <option key={idx} value={t}>{t}</option>
            ))}
          </select>

          <input
            name="packInfo"
            placeholder="Pack Info (e.g. Pack of 2)"
            value={form.packInfo}
            onChange={handleChange}
            className="w-full p-3 border rounded mb-3"
          />

          <textarea
            name="description"
            placeholder="Product Description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 border rounded mb-4"
            rows={4}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Add Product
          </button>
        </form>

        {/* LIVE PREVIEW */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Live Preview</h2>
          <div className="border rounded-xl p-4">
            {form.image && (
              <img
                src={form.image}
                alt="product"
                className="w-full h-40 object-cover rounded"
              />
            )}
            <p className="text-xs text-gray-500 mt-2">{form.type || "Product Type"}</p>
            <h3 className="text-lg font-bold mt-1">{form.title || "Product Title"}</h3>
            <p className="text-gray-600 text-sm mt-1">{form.packInfo || "Pack info"}</p>
            <p className="text-gray-500 text-sm mt-2">
              {form.description || "Product description will appear here"}
            </p>

            {/* ✅ Bangladesh currency */}
            <p className="text-green-600 font-bold mt-3">
              ৳ {form.price || "0"}
            </p>

            <button className="mt-4 w-full bg-yellow-400 py-2 rounded-lg font-semibold">
              Add to Cart (Preview)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddProducts;