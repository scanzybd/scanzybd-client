import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, Sparkles, Check, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";
import EditPackageModal from "../../../components/package/EditPackageModal";

function normalizePackages(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  return [];
}

const CATEGORY_LABELS = {
  starter: "Starter",
  standard: "Standard",
  premium: "Premium",
};

const AllPackages = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { userRole } = useAuth();
  const [editingPkg, setEditingPkg] = useState(null);

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["dashboard-packages"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/package");
      return normalizePackages(res.data);
    },
  });

  const { mutateAsync: deletePackage, isPending: isDeleting } = useMutation({
    mutationFn: (id) => axiosSecure.delete(`/api/package/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard-packages"] });
      await queryClient.invalidateQueries({ queryKey: ["homePackages"] });
    },
  });

  const handleDelete = async (pkg) => {
    const result = await Swal.fire({
      title: "Delete package?",
      html: `<strong>${pkg.title}</strong> will be removed from the homepage Offer Showcase.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await deletePackage(pkg._id);
      if (editingPkg?._id === pkg._id) {
        setEditingPkg(null);
      }
      Swal.fire({
        title: "Deleted",
        text: "Package removed.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire(
        "Failed",
        err?.response?.data?.message || "Could not delete package",
        "error"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <SmartLoader label="Loading packages..." />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh]">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-200/90 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Package className="h-3.5 w-3.5" />
            Catalog
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Package list
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pricing bundles shown on the homepage Offer Showcase.
          </p>
        </div>
        {userRole === "admin" && (
          <Link
            to="/dashboard/add-package"
            className="btn inline-flex gap-2 rounded-xl border-0 bg-emerald-500 px-5 font-semibold text-white hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            New package
          </Link>
        )}
      </div>

      {packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center">
          <Package className="h-12 w-12 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">No packages yet</p>
          <p className="mt-1 text-sm text-slate-500">
            {userRole === "admin"
              ? "Create one from “New package”."
              : "Ask an admin to create packages."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <li
              key={pkg._id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-emerald-200/90 hover:shadow-md"
            >
              {pkg.highlight && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                  <Sparkles className="h-3 w-3" />
                  Popular
                </span>
              )}

              <div className="border-b border-slate-100 bg-linear-to-br from-emerald-50/80 to-white px-5 py-4">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {CATEGORY_LABELS[pkg.category] || pkg.category || "Package"}
                </div>
                <h2 className="text-lg font-bold text-slate-900">{pkg.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                  {pkg.description}
                </p>
                <p className="mt-4 text-2xl font-bold tabular-nums text-emerald-600">
                  ৳ {Number(pkg.price).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-1 flex-col px-5 py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Includes
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  {pkg.features?.length ? (
                    pkg.features.map((feature, index) => (
                      <li key={index} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">No features listed</li>
                  )}
                </ul>

                {userRole === "admin" && (
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setEditingPkg(pkg)}
                      className="btn flex-1 gap-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/50"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(pkg)}
                      disabled={isDeleting}
                      className="btn flex-1 gap-2 rounded-xl border border-red-200 bg-white font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingPkg && (
        <EditPackageModal
          pkg={editingPkg}
          onClose={() => setEditingPkg(null)}
          onSaved={() => setEditingPkg(null)}
        />
      )}
    </div>
  );
};

export default AllPackages;
