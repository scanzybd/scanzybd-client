import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import useTagTypes from "../../../hooks/useTagTypes";
import ProductImageSlots from "../../../components/product/ProductImageSlots";
import {
  buildImagesPayload,
  imagesToFormSlots,
} from "../../../lib/productImages";

const emptyForm = () => ({
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

function productToForm(p) {
  if (!p) return emptyForm();
  const specs = p.specifications || {};
  return {
    title: p.title ?? "",
    description: p.description ?? "",
    price: p.price != null ? String(p.price) : "",
    originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
    images: imagesToFormSlots(p),
    type: p.type ?? "",
    packInfo: p.packInfo ?? "",
    validityDays: String(p.validityDays ?? 365),
    rating: p.rating != null ? String(p.rating) : "",
    reviews: p.reviews != null ? String(p.reviews) : "",
    inStock: Boolean(p.inStock),
    isActive: p.isActive !== false,
    isFeatured: Boolean(p.isFeatured),
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
  const { userRole } = useAuth();
  const { data: tagTypes = [], isLoading: tagTypesLoading } = useTagTypes();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm(productToForm(product));
    }
  }, [product]);

  if (!product) return null;
  if (userRole !== "admin") return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const media = buildImagesPayload(form.images);
      if (!media.image) {
        alert("Add at least one product image (cover).");
        setSaving(false);
        return;
      }

      const features = form.features.map((f) => f.trim()).filter(Boolean);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        originalPrice: Number(form.originalPrice) || 0,
        ...media,
        type: form.type,
        packInfo: form.packInfo.trim(),
        validityDays: Math.max(1, Number(form.validityDays) || 365),
        rating: Number(form.rating) || 0,
        reviews: Number(form.reviews) || 0,
        inStock: form.inStock,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
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

          <ProductImageSlots
            images={form.images}
            onChange={(images) => setForm((prev) => ({ ...prev, images }))}
            axiosSecure={axiosSecure}
            disabled={saving}
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="">
              {tagTypesLoading ? "Loading types…" : "Select type"}
            </option>
            {tagTypes.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
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

          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleChange}
                className="checkbox checkbox-sm checkbox-success"
              />
              <span className="text-sm font-medium">Active (visible to customers)</span>
            </label>
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
            <label className="flex cursor-pointer items-center gap-2">
              <input
                name="isFeatured"
                type="checkbox"
                checked={form.isFeatured}
                onChange={handleChange}
                className="checkbox checkbox-sm checkbox-warning"
              />
              <span className="text-sm font-medium">Featured on homepage</span>
            </label>
          </div>
          {form.isFeatured ? (
            <p className="text-xs text-amber-700">
              This product will appear in “Choose Your Smart QR Tag Package”. Any previous featured product is cleared.
            </p>
          ) : null}

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
