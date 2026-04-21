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

/** Same encoding rules as server — direct to ImgBB if server upload fails */
async function uploadToImgbbDirect(dataUrl, apiKey) {
  let base64 = String(dataUrl).trim();
  if (base64.includes("base64,")) {
    base64 = base64.split("base64,")[1];
  }
  base64 = base64.replace(/\s/g, "");
  const body = `key=${encodeURIComponent(apiKey)}&image=${encodeURIComponent(base64)}`;
  const r = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const j = await r.json();
  if (!j.success || !j.data?.url) {
    const em = j?.error?.message || j?.status_txt || "ImgBB rejected the upload";
    throw new Error(typeof em === "string" ? em : JSON.stringify(em));
  }
  return j.data.url;
}

const AddProducts = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    image: "",
    type: "",
    packInfo: "",
    /** Days of access/service validity after each successful payment (per unit). */
    validityDays: "365",

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

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }

    setUploadError(null);
    setUploadingImage(true);

    let dataUrl;
    try {
      dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });

      try {
        const res = await axiosSecure.post("/api/upload/imgbb", {
          image: dataUrl,
        });

        const url = res.data?.url;
        if (!url) {
          throw new Error(res.data?.message || "No URL returned");
        }

        setForm((prev) => ({ ...prev, image: url }));
      } catch (serverErr) {
        const viteKey = import.meta.env.VITE_image_host_key?.trim();
        if (viteKey && dataUrl) {
          try {
            const url = await uploadToImgbbDirect(dataUrl, viteKey);
            setForm((prev) => ({ ...prev, image: url }));
            setUploadError(null);
            return;
          } catch (directErr) {
            console.error("Direct ImgBB:", directErr);
          }
        }
        throw serverErr;
      }
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      const data = err.response?.data;
      let msg =
        data?.message ||
        (typeof data?.error === "string" ? data.error : null) ||
        err.message;

      if (status === 401) {
        msg = "Not logged in or session expired — sign in again and retry.";
      } else if (status === 404 && String(data?.message || "").includes("User")) {
        msg =
          "Your user account is not in the database — ask an admin to add your account.";
      } else if (status === 502 || status === 500) {
        msg = msg || "Server or ImgBB error — check IMGBB_API_KEY in server .env and restart.";
      }

      setUploadError(msg || "Upload failed — check ImgBB key on server (.env IMGBB_API_KEY)");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
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

      const res = await axiosSecure.post("/api/products", productData);

      console.log(res.data);
      alert("Product Added Successfully 🔥");
      setUploadError(null);

      // reset
      setForm({
        title: "",
        description: "",
        price: "",
        originalPrice: "",
        image: "",
        type: "",
        packInfo: "",
        validityDays: "365",
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

          {/* IMAGE — ImgBB via server */}
          <div className="mb-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/80 p-3">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Product image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFile}
              disabled={uploadingImage}
              className="w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-blue-700"
            />
            {uploadingImage && (
              <p className="mt-2 text-sm text-blue-600">Uploading to ImgBB…</p>
            )}
            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              File is sent to your server, uploaded to ImgBB, then the returned URL is saved with
              the product.
            </p>
          </div>
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL (set automatically after upload, or paste manually)"
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