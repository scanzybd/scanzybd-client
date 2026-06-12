import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router";
import SocialLogin from "../SocialLogin/SocialLogin";
import useAuth from "../../../hooks/useAuth";
import { PRODUCT_NAME } from "../../../config/company";
const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();
    const location = useLocation();
    const { signInUser } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [uiError, setUiError] = useState("");

    const from = location.state?.from?.pathname || "/";

    const onSubmit = async (data) => {
        setUiError("");
        setSubmitting(true);
        try {
            const res = await signInUser(data.email, data.password);
            const role = String(res?.data?.user?.role || "").toLowerCase();
            const destination = role === "admin" || role === "provider" ? "/dashboard" : from;

            navigate(destination, { replace: true });
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.msg ||
                error?.message ||
                "Login failed";
            if (msg.toLowerCase().includes("password is not set for this account")) {
                const goForgot = window.confirm(`${msg}\n\nGo to Forgot Password now?`);
                if (goForgot) {
                    navigate("/forgotPassword", { state: { email: data.email }, replace: true });
                    return;
                }
            }
            setUiError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-yellow-400 px-4 transition-colors dark:bg-slate-950">
            <div className="card max-w-sm w-full shadow-2xl bg-base-100">
                <div className="px-6 pt-6">
                    <h1 className="text-3xl mb-1">Welcome Back</h1>
                    <p className="text-gray-600">Login with {PRODUCT_NAME}</p>
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
                            <label className="label font-medium">Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                className="input input-bordered w-full"
                                disabled={submitting}
                                autoComplete="email"
                                {...register("email", {
                                    required: "Email is required",
                                })}
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
                                autoComplete="current-password"
                                {...register("password", {
                                    required: "Password is required",
                                })}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="mt-2 text-right">
                            <Link
                                to="/forgotPassword"
                                className={`link link-hover opacity-70 ${submitting ? "pointer-events-none opacity-40" : ""}`}
                            >
                                Forgot password?
                            </Link>
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
                                    Signing in…
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>

                        <div className="flex items-center gap-2 opacity-70">
                            <span>Don't have any Account?</span>
                            <Link
                                to="/register"
                                className={`link link-hover ${submitting ? "pointer-events-none opacity-40" : ""}`}
                            >
                                Register
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

export default Login;
