import React, { useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const AddPackage = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    features: "",
    highlight: false,
    category: "starter",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const packageData = {
      title: form.title,
      price: Number(form.price),
      description: form.description,

      // comma separated → array convert
      features: form.features
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item),

      highlight: form.highlight,
      category: form.category,

      currency: "BDT",

      createdBy: {
        name: user?.displayName,
        email: user?.email,
        uid: user?.uid,
      },

      createdAt: new Date(),
    };

    try {
      await axiosSecure.post("/api/package", packageData);

      alert("Package Added Successfully 🚀");

      setForm({
        title: "",
        price: "",
        description: "",
        features: "",
        highlight: false,
        category: "starter",
      });
    } catch (error) {
      console.log(error);
      alert("Failed to add package");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white shadow-lg rounded-2xl p-6"
      >
        <h2 className="text-2xl font-bold mb-6 text-purple-600">
          Add New Package
        </h2>

        {/* Title */}
        <input
          type="text"
          name="title"
          placeholder="Package Title"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        />

        {/* Price */}
        <input
          type="number"
          name="price"
          placeholder="Price (e.g. 2999)"
          value={form.price}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Package Description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full border p-3 rounded mb-3"
        />

        {/* Features */}
        <input
          type="text"
          name="features"
          placeholder="Features (comma separated)"
          value={form.features}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        />

        {/* Category */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        >
          <option value="starter">Starter</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>

        {/* Highlight */}
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            name="highlight"
            checked={form.highlight}
            onChange={handleChange}
          />
          Highlight Package
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700"
        >
          Add Package
        </button>
      </form>
    </div>
  );
};

export default AddPackage;