import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import PackageFormFields from "./PackageFormFields";
import {
  buildPackagePayload,
  emptyPackageForm,
  packageToForm,
  validatePackageForm,
} from "../../lib/packageFormUtils";
import { btnPrimaryInline, btnSecondary, cardSurface } from "../../lib/uiClasses";

export default function EditPackageModal({ pkg, onClose, onSaved }) {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => packageToForm(pkg));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(packageToForm(pkg));
    setErrors({});
  }, [pkg]);

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFeatureChange = (index, value) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
    if (errors.features) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.features;
        return next;
      });
    }
  };

  const addFeature = () => {
    setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (index) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const { mutateAsync: savePackage, isPending } = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosSecure.put(`/api/package/${pkg._id}`, payload);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard-packages"] });
      await queryClient.invalidateQueries({ queryKey: ["homePackages"] });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validatePackageForm(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await savePackage(buildPackagePayload(form, validation.features));
      Swal.fire({
        title: "Saved",
        text: "Package updated successfully.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      Swal.fire(
        "Failed",
        err?.response?.data?.message || "Could not update package",
        "error"
      );
    }
  };

  if (!pkg) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className={`relative max-h-[90vh] w-full max-w-xl overflow-y-auto p-6 ${cardSurface}`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 pr-8 text-xl font-bold text-slate-900 dark:text-slate-50">
          Edit package
        </h2>
        <p className="mb-6 text-sm text-slate-500">Changes appear on the homepage Offer Showcase.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PackageFormFields
            form={form}
            errors={errors}
            onFieldChange={handleFieldChange}
            onFeatureChange={handleFeatureChange}
            onAddFeature={addFeature}
            onRemoveFeature={removeFeature}
            idPrefix="edit-pkg"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onClose} className={btnSecondary} disabled={isPending}>
              Cancel
            </button>
            <button type="submit" className={btnPrimaryInline} disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
