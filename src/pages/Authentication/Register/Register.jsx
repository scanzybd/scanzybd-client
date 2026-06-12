import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SocialLogin from "../SocialLogin/SocialLogin";
import useAuth from "../../../hooks/useAuth";
import { COMPANY_NAME } from "../../../config/company";

const Register = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const { registerUser, signInUser } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [uiError, setUiError] = useState("");

    const onSubmit = async (data) => {
        setUiError("");
        setSubmitting(true);
        try {
            await registerUser(data.name, data.email, data.password);

            const loginRes = await signInUser(data.email, data.password);
            const role = String(loginRes?.data?.user?.role || "").toLowerCase();
            const destination = role === "admin" || role === "provider" ? "/dashboard" : from;
            reset();
            navigate(destination, { replace: true });
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.msg ||
                error?.message ||
                "Registration failed";
            setUiError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-yellow-400 px-4 transition-colors dark:bg-slate-950">
            <div className="card max-w-sm w-full shadow-2xl bg-base-100">
                <div className="px-6 pt-6">
                    <h1 className="text-3xl mb-1">Create Account</h1>
                    <p className="text-gray-600">Register with {COMPANY_NAME}</p>
                </div>

                <div className="card-body">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                        aria-busy={submitting}
                    >
                        {uiError ? (
                            <p
                                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
                                role="alert"
                            >
                                {uiError}
                            </p>
                        ) : null}

                        <div>
                            <label className="label font-medium">Name</label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="input input-bordered w-full"
                                disabled={submitting}
                                autoComplete="name"
                                {...register("name", { required: "Name is required" })}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label font-medium">Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                className="input input-bordered w-full"
                                disabled={submitting}
                                autoComplete="email"
                                {...register("email", { required: "Email is required" })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label font-medium">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                className="input input-bordered w-full"
                                disabled={submitting}
                                autoComplete="new-password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Minimum 6 characters",
                                    },
                                })}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn w-full"
                            disabled={submitting}
                            aria-busy={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm" />
                                    Creating account…
                                </>
                            ) : (
                                "Register"
                            )}
                        </button>

                        <div className="flex items-center gap-2 opacity-70">
                            <span>Already have an account?</span>
                            <Link
                                to="/login"
                                className={`link link-hover ${submitting ? "pointer-events-none opacity-40" : ""}`}
                            >
                                Login
                            </Link>
                        </div>

                        <div className="text-center opacity-50">Or</div>
                        <SocialLogin disabled={submitting} />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
