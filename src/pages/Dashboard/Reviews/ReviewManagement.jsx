import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";

const emptyForm = {
  type: "stat",
  label: "",
  value: "",
  text: "",
  author: "",
  source: "",
  avatar: "",
  stars: 5,
  order: 0,
  isActive: true,
};

const ReviewManagement = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["dashboard-reviews"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/reviews/all");
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });

  const stats = useMemo(() => reviews.filter((r) => r.type === "stat"), [reviews]);
  const testimonials = useMemo(
    () => reviews.filter((r) => r.type === "testimonial"),
    [reviews]
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const saveReview = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await axiosSecure.put(`/api/reviews/${editingId}`, form);
      } else {
        await axiosSecure.post("/api/reviews", form);
      }
      await queryClient.invalidateQueries({ queryKey: ["dashboard-reviews"] });
      await queryClient.invalidateQueries({ queryKey: ["public-reviews"] });
      resetForm();
      Swal.fire({
        icon: "success",
        title: editingId ? "Review updated" : "Review added",
        timer: 1300,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Failed", error?.response?.data?.message || "Could not save review", "error");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item) => {
    setEditingId(item._id);
    setForm({
      type: item.type || "stat",
      label: item.label || "",
      value: item.value || "",
      text: item.text || "",
      author: item.author || "",
      source: item.source || "",
      avatar: item.avatar || "",
      stars: item.stars || 5,
      order: item.order || 0,
      isActive: item.isActive !== false,
    });
  };

  const onDelete = async (item) => {
    const result = await Swal.fire({
      title: "Delete review?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;

    try {
      await axiosSecure.delete(`/api/reviews/${item._id}`);
      await queryClient.invalidateQueries({ queryKey: ["dashboard-reviews"] });
      await queryClient.invalidateQueries({ queryKey: ["public-reviews"] });
    } catch (error) {
      Swal.fire("Failed", error?.response?.data?.message || "Could not delete review", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <SmartLoader label="Loading reviews..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-2 text-white">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Review Management</h1>
            <p className="text-sm text-slate-600">
              Add or edit home-page stats and customer testimonials.
            </p>
          </div>
        </div>

        <form onSubmit={saveReview} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
            className="select select-bordered rounded-xl border-slate-200"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option value="stat">Stat card</option>
            <option value="testimonial">Testimonial</option>
          </select>
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) || 0 }))}
            className="input input-bordered rounded-xl border-slate-200"
            placeholder="Display order"
          />

          {form.type === "stat" ? (
            <>
              <input
                value={form.label}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                className="input input-bordered rounded-xl border-slate-200"
                placeholder="Label (e.g. Active Tags)"
                required
              />
              <input
                value={form.value}
                onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                className="input input-bordered rounded-xl border-slate-200"
                placeholder="Value (e.g. 950,000+)"
                required
              />
            </>
          ) : (
            <>
              <input
                value={form.author}
                onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                className="input input-bordered rounded-xl border-slate-200"
                placeholder="Customer name"
                required
              />
              <input
                value={form.source}
                onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
                className="input input-bordered rounded-xl border-slate-200"
                placeholder="Source"
              />
              <input
                value={form.avatar}
                onChange={(e) => setForm((prev) => ({ ...prev, avatar: e.target.value }))}
                className="input input-bordered rounded-xl border-slate-200"
                placeholder="Avatar emoji (optional)"
              />
              <input
                type="number"
                min={1}
                max={5}
                value={form.stars}
                onChange={(e) => setForm((prev) => ({ ...prev, stars: Number(e.target.value) || 5 }))}
                className="input input-bordered rounded-xl border-slate-200"
                placeholder="Stars"
              />
              <textarea
                value={form.text}
                onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
                className="textarea textarea-bordered rounded-xl border-slate-200 md:col-span-2"
                placeholder="Testimonial text"
                required
              />
            </>
          )}

          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="checkbox checkbox-sm"
            />
            Active
          </label>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="btn rounded-xl border-0 bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              {editingId ? "Update review" : "Add review"}
            </button>
            {editingId ? (
              <button type="button" className="btn rounded-xl" onClick={resetForm}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Stat Cards</h2>
          <div className="space-y-3">
            {stats.map((item) => (
              <article
                key={item._id}
                className="rounded-xl border border-slate-200 p-3 text-sm"
              >
                <p className="font-semibold text-slate-900">
                  {item.label}: {item.value}
                </p>
                <p className="text-xs text-slate-500">Order: {item.order}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="btn btn-xs" onClick={() => onEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs border-rose-200 bg-rose-50 text-rose-700"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {stats.length === 0 ? <p className="text-sm text-slate-500">No stat added yet.</p> : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Testimonials</h2>
          <div className="space-y-3">
            {testimonials.map((item) => (
              <article
                key={item._id}
                className="rounded-xl border border-slate-200 p-3 text-sm"
              >
                <p className="font-semibold text-slate-900">
                  {item.author} {item.source ? `- ${item.source}` : ""}
                </p>
                <p className="text-slate-600">{item.text}</p>
                <p className="text-xs text-slate-500">Stars: {item.stars} | Order: {item.order}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="btn btn-xs" onClick={() => onEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs border-rose-200 bg-rose-50 text-rose-700"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {testimonials.length === 0 ? (
              <p className="text-sm text-slate-500">No testimonial added yet.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReviewManagement;
