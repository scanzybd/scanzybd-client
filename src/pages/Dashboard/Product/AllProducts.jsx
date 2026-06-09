import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { GripVertical, Pencil, Package, Plus, Search } from "lucide-react";
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
  const [busyId, setBusyId] = useState(null);
  const [orderedProducts, setOrderedProducts] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["dashboard-products"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/products/mine");
      return normalizeList(res.data);
    },
  });

  useEffect(() => {
    setOrderedProducts(products);
  }, [products]);

  const canReorder = userRole === "admin" && !search.trim();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const source = canReorder ? orderedProducts : products;
    if (!q) return source;
    return source.filter((p) =>
      `${p.title} ${p.type} ${p.description || ""}`.toLowerCase().includes(q)
    );
  }, [products, orderedProducts, search, canReorder]);

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const toggleActive = async (product) => {
    const isOn = product.isActive !== false;
    const next = !isOn;
    setBusyId(product._id);
    try {
      await axiosSecure.put(`/api/products/${product._id}`, { isActive: next });
      handleSaved();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update product status.");
    } finally {
      setBusyId(null);
    }
  };

  const saveOrder = async (nextList) => {
    setSavingOrder(true);
    try {
      await axiosSecure.patch("/api/products/reorder", {
        orderedIds: nextList.map((p) => p._id),
      });
      setOrderedProducts(nextList);
      handleSaved();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to save product order.");
      setOrderedProducts(products);
    } finally {
      setSavingOrder(false);
      setDragIndex(null);
      setDropIndex(null);
    }
  };

  const handleDrop = (index) => {
    if (!canReorder || dragIndex === null || dragIndex === index || savingOrder) return;

    const next = [...orderedProducts];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    saveOrder(next);
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
          {canReorder && filtered.length > 1 && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              <GripVertical className="h-3.5 w-3.5" />
              Drag cards to change order on the customer product page.
            </p>
          )}
          {search.trim() && userRole === "admin" && (
            <p className="mt-2 text-xs text-amber-700">
              Clear search to drag and reorder products.
            </p>
          )}
          {savingOrder && (
            <p className="mt-2 text-xs font-medium text-emerald-700">Saving order…</p>
          )}
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
          {filtered.map((product, index) => {
            const active = product.isActive !== false;
            const serial =
              canReorder && !search.trim()
                ? orderedProducts.findIndex((p) => p._id === product._id) + 1
                : index + 1;
            const isDragging = canReorder && dragIndex === index;
            const isDropTarget = canReorder && dropIndex === index && dragIndex !== index;

            return (
              <li
                key={product._id}
                onDragOver={(e) => {
                  if (!canReorder || savingOrder) return;
                  e.preventDefault();
                  setDropIndex(index);
                }}
                onDragLeave={() => {
                  if (dropIndex === index) setDropIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(index);
                }}
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
                  active
                    ? "border-slate-200/90 hover:border-emerald-200/80"
                    : "border-rose-200/80 opacity-90"
                } ${isDragging ? "opacity-50 ring-2 ring-emerald-400" : ""} ${
                  isDropTarget ? "ring-2 ring-emerald-500 ring-offset-2" : ""
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {canReorder && (
                    <button
                      type="button"
                      draggable={!savingOrder}
                      onDragStart={() => setDragIndex(index)}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setDropIndex(null);
                      }}
                      disabled={savingOrder}
                      title="Drag to reorder"
                      className="absolute left-3 top-3 z-10 flex h-8 w-8 cursor-grab items-center justify-center rounded-lg bg-white/95 text-slate-600 shadow active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full bg-slate-900/85 px-2.5 py-0.5 text-[10px] font-bold tabular-nums tracking-wide text-white">
                    #{serial}
                  </span>
                  <img
                    src={product.image}
                    alt=""
                    className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] ${
                      active ? "" : "grayscale-[0.35]"
                    }`}
                  />
                  <span className="absolute left-3 top-12 rounded-full bg-slate-900/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {product.type}
                  </span>
                  <span
                    className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${
                      active ? "bg-emerald-600" : "bg-rose-600"
                    }`}
                  >
                    {active ? "Active" : "Inactive"}
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

                  {userRole === "admin" ? (
                    <div className="mt-4 space-y-3">
                      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {active ? "Visible to customers" : "Hidden from store"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {active
                              ? "Customers can view and add to cart."
                              : "Only visible here in the dashboard."}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-success"
                          checked={active}
                          disabled={busyId === product._id || savingOrder}
                          title={active ? "Deactivate product" : "Activate product"}
                          onChange={() => toggleActive(product)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditing(product)}
                        disabled={savingOrder}
                        className="btn btn-block gap-2 rounded-xl border-0 bg-slate-900 font-semibold text-white hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit product
                      </button>
                    </div>
                  ) : (
                    <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                      View only — contact an admin to edit.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
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
