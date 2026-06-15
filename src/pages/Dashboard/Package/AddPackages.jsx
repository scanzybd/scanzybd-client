import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, Package } from "lucide-react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import PackageFormFields from "../../../components/package/PackageFormFields";
import PackageOfferPreview from "../../../components/package/PackageOfferPreview";
import {
  buildPackagePayload,
  emptyPackageForm,
  validatePackageForm,
} from "../../../lib/packageFormUtils";
import {
  btnPrimaryInline,
  btnSecondaryInline,
  cardSurface,
  dashboardBadge,
  dashboardPageHeader,
  dashboardPageSubtitle,
  dashboardPageTitle,
  textMuted,
} from "../../../lib/uiClasses";

const AddPackage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyPackageForm);
  const [errors, setErrors] = useState({});

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

  const { mutateAsync: createPackage, isPending } = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosSecure.post("/api/package", payload);
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
      await createPackage(buildPackagePayload(form, validation.features));
      await Swal.fire({
        title: "Package added",
        text: "It will appear on the homepage Offer Showcase.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      setForm(emptyPackageForm());
      setErrors({});
      navigate("/dashboard/all-packages");
    } catch (err) {
      Swal.fire(
        "Failed",
        err?.response?.data?.message || "Could not add package",
        "error"
      );
    }
  };

  return (
    <div className="min-h-[60vh]">
      <div className={dashboardPageHeader}>
        <Link
          to="/dashboard/all-packages"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to package list
        </Link>
        <div className={dashboardBadge}>
          <Package className="h-3.5 w-3.5" />
          Homepage offers
        </div>
        <h1 className={dashboardPageTitle}>Add new package</h1>
        <p className={dashboardPageSubtitle}>
          This package is shown on the homepage Offer Showcase section.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <form onSubmit={handleSubmit} className={`p-6 ${cardSurface}`}>
          <PackageFormFields
            form={form}
            errors={errors}
            onFieldChange={handleFieldChange}
            onFeatureChange={handleFeatureChange}
            onAddFeature={addFeature}
            onRemoveFeature={removeFeature}
            idPrefix="add-pkg"
          />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link to="/dashboard/all-packages" className={btnSecondaryInline}>
              Cancel
            </Link>
            <button type="submit" className={btnPrimaryInline} disabled={isPending}>
              {isPending ? "Saving..." : "Add package"}
            </button>
          </div>
        </form>

        <aside className={`p-6 ${cardSurface} xl:sticky xl:top-6 xl:self-start`}>
          <div className="mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Live Preview</h2>
          </div>
          <p className={`mb-5 text-sm ${textMuted}`}>
            Homepage Offer Showcase card — updates as you type.
          </p>
          <PackageOfferPreview form={form} />
        </aside>
      </div>
    </div>
  );
};

export default AddPackage;
