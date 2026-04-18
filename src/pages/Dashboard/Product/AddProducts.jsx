import React, { useState } from "react";
import useAuth from "../../../hooks/useAuth";
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
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    image: "",
    type: "",
    packInfo: "",

    rating: "",
    reviews: "",
    inStock: true,

    features: [""],

    specifications: {
      material: "",
      dimensions: "",
      weight: "",
      battery: "",
      waterproof: "",
    },
  });

  // ======================
  // BASIC CHANGE HANDLER
  // ======================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ======================
  // FEATURES HANDLERS
  // ======================
  const handleFeatureChange = (index, value) => {
    const updated = [...form.features];
    updated[index] = value;
    setForm({ ...form, features: updated });
  };

  const addFeature = () => {
    setForm({ ...form, features: [...form.features, ""] });
  };

  // ======================
  // SPECIFICATIONS HANDLER
  // ======================
  const handleSpecChange = (key, value) => {
    setForm({
      ...form,
      specifications: {
        ...form.specifications,
        [key]: value,
      },
    });
  };

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        ...form,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        rating: Number(form.rating),
        reviews: Number(form.reviews),

        createdBy: {
          name: user?.displayName,
          email: user?.email,
          uid: user?.uid,
        },

        createdAt: new Date(),
      };

      const res = await axiosSecure.post("/api/products", productData);

      console.log(res.data);
      alert("Product Added Successfully 🔥");

      // reset
      setForm({
        title: "",
        description: "",
        price: "",
        originalPrice: "",
        image: "",
        type: "",
        packInfo: "",
        rating: "",
        reviews: "",
        inStock: true,
        features: [""],
        specifications: {
          material: "",
          dimensions: "",
          weight: "",
          battery: "",
          waterproof: "",
        },
      });
    } catch (err) {
      console.log(err);
      alert("Failed to add product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex justify-center">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">

        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold text-blue-600 mb-6">
            Add New Product
          </h2>

          {/* TITLE */}
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Product Title"
            className="w-full p-3 border rounded mb-3"
          />

          {/* PRICE */}
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full p-3 border rounded mb-3"
          />

          {/* ORIGINAL PRICE */}
          <input
            name="originalPrice"
            value={form.originalPrice}
            onChange={handleChange}
            placeholder="Original Price"
            className="w-full p-3 border rounded mb-3"
          />

          {/* IMAGE */}
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL"
            className="w-full p-3 border rounded mb-3"
          />

          {/* TYPE */}
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-3 border rounded mb-3"
          >
            <option value="">Select Product Type</option>
            {productTypes.map((t, i) => (
              <option key={i} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* PACK INFO */}
          <input
            name="packInfo"
            value={form.packInfo}
            onChange={handleChange}
            placeholder="Pack Info"
            className="w-full p-3 border rounded mb-3"
          />

          {/* RATING & REVIEWS */}
          <div className="grid grid-cols-2 gap-2">
            <input
              name="rating"
              value={form.rating}
              onChange={handleChange}
              placeholder="Rating"
              className="p-3 border rounded mb-3"
            />

            <input
              name="reviews"
              value={form.reviews}
              onChange={handleChange}
              placeholder="Reviews Count"
              className="p-3 border rounded mb-3"
            />
          </div>

          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            rows={4}
            className="w-full p-3 border rounded mb-3"
          />

          {/* FEATURES */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Features</h3>

            {form.features.map((f, i) => (
              <input
                key={i}
                value={f}
                onChange={(e) => handleFeatureChange(i, e.target.value)}
                placeholder={`Feature ${i + 1}`}
                className="w-full p-2 border rounded mb-2"
              />
            ))}

            <button
              type="button"
              onClick={addFeature}
              className="text-blue-600 text-sm"
            >
              + Add Feature
            </button>
          </div>

          {/* SPECIFICATIONS */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input
              placeholder="Material"
              value={form.specifications.material}
              onChange={(e) =>
                handleSpecChange("material", e.target.value)
              }
              className="p-2 border rounded"
            />

            <input
              placeholder="Dimensions"
              value={form.specifications.dimensions}
              onChange={(e) =>
                handleSpecChange("dimensions", e.target.value)
              }
              className="p-2 border rounded"
            />

            <input
              placeholder="Weight"
              value={form.specifications.weight}
              onChange={(e) =>
                handleSpecChange("weight", e.target.value)
              }
              className="p-2 border rounded"
            />

            <input
              placeholder="Battery"
              value={form.specifications.battery}
              onChange={(e) =>
                handleSpecChange("battery", e.target.value)
              }
              className="p-2 border rounded"
            />

            <input
              placeholder="Waterproof"
              value={form.specifications.waterproof}
              onChange={(e) =>
                handleSpecChange("waterproof", e.target.value)
              }
              className="p-2 border rounded"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Add Product
          </button>
        </form>

        {/* ================= LIVE PREVIEW ================= */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Live Preview</h2>

          {form.image && (
            <img
              src={form.image}
              className="w-full h-44 object-cover rounded"
            />
          )}

          <p className="text-gray-500 text-sm mt-2">
            {form.type || "Type"}
          </p>

          <h3 className="text-lg font-bold">
            {form.title || "Product Title"}
          </h3>

          <p className="text-gray-600 text-sm">
            {form.packInfo}
          </p>

          <p className="text-gray-500 mt-2">
            {form.description}
          </p>

          <p className="text-green-600 font-bold mt-3">
            ৳ {form.price || 0}
          </p>

          <button className="mt-4 w-full bg-yellow-400 py-2 rounded-lg">
            Add to Cart (Preview)
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddProducts;