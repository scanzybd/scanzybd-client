import React, { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Mail, Lock, User, Shield } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const CreateUserForm = ({ role, badge, title, description }) => {
    const axiosSecure = useAxiosSecure();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirm: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setFeedback(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback(null);

        if (!form.name.trim() || !form.email.trim() || !form.password) {
            setFeedback({ type: "error", text: "Please fill in all required fields." });
            return;
        }

        if (form.password.length < 6) {
            setFeedback({ type: "error", text: "Password must be at least 6 characters." });
            return;
        }

        if (form.password !== form.confirm) {
            setFeedback({ type: "error", text: "Passwords do not match." });
            return;
        }

        setSubmitting(true);
        try {
            await axiosSecure.post("/api/users", {
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                role,
            });
            setFeedback({
                type: "success",
                text: "Account created. They can sign in with this email and password.",
            });
            setForm({ name: "", email: "", password: "", confirm: "" });
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                "Could not create account.";
            setFeedback({ type: "error", text: msg });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-lg">
            <Link
                to="/dashboard/user-management"
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to user management
            </Link>

            <div className="mb-8 border-b border-slate-200/90 pb-6">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    <Shield className="h-3.5 w-3.5" />
                    {badge}
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    {title}
                </h1>
                <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm"
            >
                {feedback && (
                    <div
                        className={`rounded-xl border px-3 py-2 text-sm ${
                            feedback.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                : "border-rose-200 bg-rose-50 text-rose-900"
                        }`}
                    >
                        {feedback.text}
                    </div>
                )}

                <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <User className="h-3 w-3" />
                        Full name
                    </label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="name"
                        className="input input-bordered w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="Name"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Mail className="h-3 w-3" />
                        Email
                    </label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        className="input input-bordered w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="email@example.com"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Lock className="h-3 w-3" />
                        Password
                    </label>
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        className="input input-bordered w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="At least 6 characters"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Confirm password
                    </label>
                    <input
                        name="confirm"
                        type="password"
                        value={form.confirm}
                        onChange={handleChange}
                        autoComplete="new-password"
                        className="input input-bordered w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="Repeat password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-block gap-2 rounded-xl border-0 bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                    {submitting ? "Creating…" : "Create account"}
                </button>
            </form>
        </div>
    );
};

export default CreateUserForm;
