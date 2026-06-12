import React, { useState } from "react";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router";

const SocialLogin = ({ disabled = false }) => {
    const { signInGoogle } = useAuth();
    const navigate = useNavigate();
    const [signingIn, setSigningIn] = useState(false);
    const [error, setError] = useState("");

    const handleGoogleSignIn = async () => {
        if (signingIn || disabled) return;
        setError("");
        setSigningIn(true);
        try {
            const res = await signInGoogle();
            const role = String(res?.data?.user?.role || "").toLowerCase();
            const destination =
                role === "admin" || role === "provider" ? "/dashboard" : "/";
            navigate(destination, { replace: true });
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.msg ||
                err?.message ||
                "Google sign-in failed. Please try again.";
            setError(msg);
        } finally {
            setSigningIn(false);
        }
    };

    const busy = signingIn || disabled;

    return (
        <div className="mb-4 space-y-2">
            {error ? (
                <p
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
                    role="alert"
                >
                    {error}
                </p>
            ) : null}
            {signingIn ? (
                <p className="text-center text-xs text-slate-500" aria-live="polite">
                    Complete Google sign-in, then wait while we connect your account…
                </p>
            ) : null}
            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={busy}
                aria-busy={signingIn}
                className="btn bg-white text-black border-[#e5e5e5] w-full disabled:opacity-70"
            >
                {signingIn ? (
                    <>
                        <span className="loading loading-spinner loading-sm" />
                        Signing in with Google…
                    </>
                ) : (
                    <>
                        <svg
                            aria-hidden
                            width="16"
                            height="16"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                        >
                            <g>
                                <path d="m0 0H512V512H0" fill="#fff"></path>
                                <path
                                    fill="#34a853"
                                    d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                                ></path>
                                <path
                                    fill="#4285f4"
                                    d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                                ></path>
                                <path
                                    fill="#fbbc02"
                                    d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                                ></path>
                                <path
                                    fill="#ea4335"
                                    d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                                ></path>
                            </g>
                        </svg>
                        Login with Google
                    </>
                )}
            </button>
        </div>
    );
};

export default SocialLogin;
