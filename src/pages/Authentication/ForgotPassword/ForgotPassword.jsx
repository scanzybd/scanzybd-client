import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { sendUserPasswordResetEmail } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const initialEmail = location.state?.email || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: initialEmail },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await sendUserPasswordResetEmail(data.email.trim());
      await Swal.fire({
        icon: "success",
        title: t("auth.forgot.emailSentTitle"),
        text: t("auth.forgot.emailSentText"),
        confirmButtonText: t("auth.forgot.ok"),
      });
      try {
        sessionStorage.setItem("fp_email", data.email.trim());
      } catch {
        /* ignore */
      }
      navigate("/forgotPassword/enterCode", {
        state: { email: data.email.trim() },
        replace: true,
      });
    } catch (err) {
      const code = err?.response?.status;
      let msg = t("auth.forgot.errGeneric");
      if (code === 400) {
        msg = err?.response?.data?.message || t("auth.forgot.errInvalidEmail");
      } else if (code === 429) {
        msg = t("auth.forgot.errTooManyRequests");
      } else if (!err?.response) {
        msg = "Server unreachable. Start backend and database first.";
      }
      await Swal.fire({
        icon: "error",
        title: t("auth.forgot.failed"),
        text: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-4 transition-colors dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="card bg-base-100 shadow-xl">
          <div className="space-y-1 px-6 pt-6 text-center">
            <h1 className="text-3xl font-bold">{t("auth.forgot.title")}</h1>
            <p className="text-gray-600">{t("auth.forgot.subtitle")}</p>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label font-medium">Email</label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="Enter Email"
                  autoComplete="email"
                  disabled={submitting}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email format",
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  t("auth.forgot.sendResetLink")
                )}
              </button>

              <div className="text-center text-sm opacity-80">
                <span>{t("auth.forgot.rememberPrompt")} </span>
                <Link to="/login" className="link link-hover text-lime-700">
                  {t("auth.forgot.loginLink")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
