import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const productTypes = [
  "Car Tag",
  "Bike Tag",
  "Helmet Tag",
  "Pack of 1",
  "Pack of 2",
  "Starter Pack",
];

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

const emptyForm = () => ({
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

function productToForm(p) {
  if (!p) return emptyForm();
  const specs = p.specifications || {};
  return {
    title: p.title ?? "",
    description: p.description ?? "",
    price: p.price != null ? String(p.price) : "",
    originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
    image: p.image ?? "",
    type: p.type ?? "",
    packInfo: p.packInfo ?? "",
    validityDays: String(p.validityDays ?? 365),
    rating: p.rating != null ? String(p.rating) : "",
    reviews: p.reviews != null ? String(p.reviews) : "",
    inStock: Boolean(p.inStock),
    features:
      Array.isArray(p.features) && p.features.length > 0 ? p.features : [""],
    specifications: {
      material: specs.material ?? "",
      dimensions: specs.dimensions ?? "",
      weight: specs.weight ?? "",
      battery: specs.battery ?? "",
      waterproof: specs.waterproof ?? "",
    },
  };
}

const EditProductModal = ({ product, onClose, onSaved }) => {
  const axiosSecure = useAxiosSecure();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    if (product) {
      setForm(productToForm(product));
      setUploadError(null);
    }
  }, [product]);

  if (!product) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    const updated = [...form.features];
    updated[index] = value;
    setForm({ ...form, features: updated });
  };

  const addFeature = () => {
    setForm({ ...form, features: [...form.features, ""] });
  };

  const handleSpecChange = (key, value) => {
    setForm({
      ...form,
      specifications: { ...form.specifications, [key]: value },
    });
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setUploadError("Choose an image file.");
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
        const res = await axiosSecure.post("/api/upload/imgbb", { image: dataUrl });
        const url = res.data?.url;
        if (!url) throw new Error(res.data?.message || "No URL");
        setForm((prev) => ({ ...prev, image: url }));
      } catch (serverErr) {
        const viteKey = import.meta.env.VITE_image_host_key?.trim();
        if (viteKey && dataUrl) {
          const url = await uploadToImgbbDirect(dataUrl, viteKey);
          setForm((prev) => ({ ...prev, image: url }));
        } else {
          throw serverErr;
        }
      }
    } catch (err) {
      setUploadError(
        err.response?.data?.message || err.message || "Image upload failed"
      );
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const features = form.features.map((f) => f.trim()).filter(Boolean);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        originalPrice: Number(form.originalPrice) || 0,
        image: form.image.trim(),
        type: form.type,
        packInfo: form.packInfo.trim(),
        validityDays: Math.max(1, Number(form.validityDays) || 365),
        rating: Number(form.rating) || 0,
        reviews: Number(form.reviews) || 0,
        inStock: form.inStock,
        features,
        specifications: {
          material: form.specifications.material?.trim() || "",
          dimensions: form.specifications.dimensions?.trim() || "",
          weight: form.specifications.weight?.trim() || "",
          battery: form.specifications.battery?.trim() || "",
          waterproof: form.specifications.waterproof?.trim() || "",
        },
      };

      await axiosSecure.put(`/api/products/${product._id}`, payload);
      onSaved?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Edit product</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="input input-bordered w-full"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              type="number"
              min="0"
              step="0.01"
              className="input input-bordered w-full"
              required
            />
            <input
              name="originalPrice"
              value={form.originalPrice}
              onChange={handleChange}
              placeholder="Original price"
              type="number"
              min="0"
              step="0.01"
              className="input input-bordered w-full"
            />
          </div>

          <div className="rounded-lg border border-dashed border-slate-200 p-3">
            <label className="mb-1 block text-sm font-medium">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFile}
              disabled={uploadingImage}
              className="file:mr-2 file:rounded file:bg-blue-600 file:px-2 file:py-1 file:text-sm file:text-white"
            />
            {uploadingImage && (
              <p className="mt-1 text-sm text-blue-600">Uploading…</p>
            )}
            {uploadError && <p className="mt-1 text-sm text-red-600">{uploadError}</p>}
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="Image URL"
              className="input input-bordered mt-2 w-full text-sm"
              required
            />
          </div>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="">Select type</option>
            {productTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            name="packInfo"
            value={form.packInfo}
            onChange={handleChange}
            placeholder="Pack info"
            className="input input-bordered w-full"
          />

          <input
            name="validityDays"
            type="number"
            min={1}
            value={form.validityDays}
            onChange={handleChange}
            placeholder="Validity days"
            className="input input-bordered w-full"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              name="rating"
              value={form.rating}
              onChange={handleChange}
              placeholder="Rating"
              className="input input-bordered w-full"
            />
            <input
              name="reviews"
              value={form.reviews}
              onChange={handleChange}
              placeholder="Reviews"
              className="input input-bordered w-full"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              name="inStock"
              type="checkbox"
              checked={form.inStock}
              onChange={handleChange}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">In stock</span>
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            rows={3}
            className="textarea textarea-bordered w-full"
            required
          />

          <div>
            <p className="mb-1 text-sm font-medium">Features</p>
            {form.features.map((f, i) => (
              <input
                key={i}
                value={f}
                onChange={(e) => handleFeatureChange(i, e.target.value)}
                className="input input-bordered mb-2 w-full"
                placeholder={`Feature ${i + 1}`}
              />
            ))}
            <button type="button" onClick={addFeature} className="text-sm text-blue-600">
              + Add feature
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {["material", "dimensions", "weight", "battery", "waterproof"].map((key) => (
              <input
                key={key}
                placeholder={key}
                value={form.specifications[key]}
                onChange={(e) => handleSpecChange(key, e.target.value)}
                className="input input-bordered w-full capitalize"
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex-1"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
