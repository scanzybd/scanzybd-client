import React, { useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useTagTypes from "../../../hooks/useTagTypes";
import ProductImageSlots from "../../../components/product/ProductImageSlots";
import {
  buildImagesPayload,
  imagesToFormSlots,
} from "../../../lib/productImages";

const emptyAddForm = () => ({
  title: "",
  description: "",
  price: "",
  originalPrice: "",
  images: imagesToFormSlots(null),
  type: "",
  packInfo: "",
  validityDays: "365",
  rating: "",
  reviews: "",
  inStock: true,
  isActive: true,
  isFeatured: false,
  features: [""],
  specifications: {
    material: "",
    dimensions: "",
    weight: "",
    battery: "",
    waterproof: "",
  },
});

const AddProducts = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const { data: tagTypes = [], isLoading: tagTypesLoading } = useTagTypes();

  const [form, setForm] = useState(emptyAddForm);

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
      const media = buildImagesPayload(form.images);
      if (!media.image) {
        alert("Add at least one product image (cover).");
        return;
      }

      const { images: _imageSlots, ...restForm } = form;
      const productData = {
        ...restForm,
        ...media,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        validityDays: Math.max(1, Number(form.validityDays) || 365),
        rating: Number(form.rating),
        reviews: Number(form.reviews),

        createdBy: {
          name: user?.displayName,
          email: user?.email,
          uid: user?.uid,
        },

        createdAt: new Date(),
      };

      await axiosSecure.post("/api/products", productData);

      alert("Product Added Successfully 🔥");
      setForm(emptyAddForm());
    } catch {
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
            placeholder="Discount price"
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

          <ProductImageSlots
            images={form.images}
            onChange={(images) => setForm((prev) => ({ ...prev, images }))}
            axiosSecure={axiosSecure}
          />

          <div className="mb-3 flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                name="isFeatured"
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))
                }
                className="checkbox checkbox-sm checkbox-warning"
              />
              <span className="text-sm font-medium text-slate-800">
                Featured on homepage
              </span>
            </label>
            {form.isFeatured ? (
              <p className="w-full text-xs text-amber-700">
                Shows under “Choose Your Smart QR Tag Package”. Only one product can be featured.
              </p>
            ) : null}
          </div>

          {/* TYPE */}
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-3 border rounded mb-3"
          >
            <option value="">
              {tagTypesLoading ? "Loading types…" : "Select Product Type"}
            </option>
            {tagTypes.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
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

          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Validity (days per unit after payment)
            </label>
            <input
              name="validityDays"
              type="number"
              min={1}
              value={form.validityDays}
              onChange={handleChange}
              placeholder="365"
              className="w-full p-3 border rounded"
            />
            <p className="mt-1 text-xs text-gray-500">
              Checkout: total days = this × quantity. After that, customer can renew.
            </p>
          </div>

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

          {form.images?.[0] && (
            <img
              src={form.images[0]}
              alt={form.title || "Product Image"}
              className="w-full h-44 object-cover rounded"
            />
          )}
          {form.images?.filter(Boolean).length > 1 ? (
            <div className="mt-2 grid grid-cols-4 gap-1">
              {form.images.filter(Boolean).map((url, i) => (
                <img
                  key={`${url}-${i}`}
                  src={url}
                  alt=""
                  className="aspect-square rounded object-cover"
                />
              ))}
            </div>
          ) : null}

          <p className="text-gray-500 text-sm mt-2">
            {form.type || "Type"}
          </p>

          <h3 className="text-lg font-bold">
            {form.title || "Product Title"}
          </h3>

          <p className="text-gray-600 text-sm">
            {form.packInfo || "Package Info"}
          </p>

          <p className="text-gray-500 mt-2">
            {form.description || "No description provided."}
          </p>

          <div className="flex flex-wrap gap-2 my-2">
            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
              Validity: {form.validityDays || "365"} days
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              In Stock: {form.inStock ? "Yes" : "No"}
            </span>
            <span className="px-2 py-1 bg-yellow-50 text-yellow-800 rounded text-xs">
              Rating: {form.rating || "0"}
            </span>
            <span className="px-2 py-1 bg-purple-50 text-purple-800 rounded text-xs">
              Reviews: {form.reviews || "0"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-gray-500 text-xs">
              <b>Material:</b> {form.specifications?.material || "-"}
            </span>
            <span className="text-gray-500 text-xs">
              <b>Dimensions:</b> {form.specifications?.dimensions || "-"}
            </span>
            <span className="text-gray-500 text-xs">
              <b>Weight:</b> {form.specifications?.weight || "-"}
            </span>
            <span className="text-gray-500 text-xs">
              <b>Battery:</b> {form.specifications?.battery || "-"}
            </span>
            <span className="text-gray-500 text-xs">
              <b>Waterproof:</b> {form.specifications?.waterproof || "-"}
            </span>
          </div>

          {Array.isArray(form.features) && form.features.filter(Boolean).length > 0 && (
            <ul className="list-disc pl-6 mt-2 text-xs text-gray-700">
              {form.features.filter(Boolean).map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-4 mt-4">
            <p className="text-green-600 font-bold text-lg">
              ৳ {form.price || 0}
            </p>
            {form.originalPrice && (
              <span className="text-gray-400 line-through text-sm">
                ৳ {form.originalPrice}
              </span>
            )}
          </div>

          <button className="mt-4 w-full bg-yellow-400 py-2 rounded-lg">
            Add to Cart (Preview)
          </button>
        </div>
  

      </div>
    </div>
  );
};

export default AddProducts;