import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Pencil, Package, Plus, Search } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";
import EditProductModal from "./EditProductModal";

function normalizeList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  return [];
}

const AllProducts = () => {
  const axiosSecure = useAxiosSecure();
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["dashboard-products"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/products/mine");
      return normalizeList(res.data);
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      `${p.title} ${p.type} ${p.description || ""}`.toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <SmartLoader label="Loading products..." />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh]">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-200/90 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Package className="h-3.5 w-3.5" />
            Store
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Product list
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Edit catalog items shown on the storefront.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full min-w-[200px] max-w-md sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input input-bordered w-full rounded-xl border-slate-200 bg-white pl-10 pr-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          {userRole === "admin" && (
            <Link
              to="/dashboard/add-product"
              className="btn inline-flex shrink-0 gap-2 rounded-xl border-0 bg-emerald-500 font-semibold text-white hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4" />
              Add product
            </Link>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center">
          <Package className="h-12 w-12 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">
            {products.length === 0 ? "No products yet" : "No matches"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {products.length === 0
              ? userRole === "admin"
                ? "Create a product to see it here."
                : "No products in the catalog yet."
              : "Try another search."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <li
              key={product._id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-emerald-200/80 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={product.image}
                  alt=""
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <span className="absolute left-3 top-3 rounded-full bg-slate-900/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {product.type}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h2 className="line-clamp-2 text-lg font-bold text-slate-900">{product.title}</h2>
                {product.packInfo && (
                  <p className="mt-1 text-sm text-slate-500">{product.packInfo}</p>
                )}
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600">{product.description}</p>

                <p className="mt-3 text-xl font-bold tabular-nums text-emerald-600">
                  ৳ {Number(product.price).toLocaleString()}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Validity: {product.validityDays ?? 365} days / unit
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Added by {product?.createdBy?.name || "—"}
                </p>

                <button
                  type="button"
                  onClick={() => setEditing(product)}
                  className="btn btn-block mt-4 gap-2 rounded-xl border-0 bg-slate-900 font-semibold text-white hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" />
                  Edit product
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <EditProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default AllProducts;
