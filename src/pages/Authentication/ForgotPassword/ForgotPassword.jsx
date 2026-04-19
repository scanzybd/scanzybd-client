import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sendUserPasswordResetEmail } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
      navigate("/forgotPassword/enterCode", {
        state: { email: data.email.trim() },
        replace: true,
      });
    } catch (err) {
      const code = err?.code || "";
      let msg = t("auth.forgot.errGeneric");
      if (code === "auth/user-not-found") {
        msg = t("auth.forgot.errUserNotFound");
      } else if (code === "auth/invalid-email") {
        msg = t("auth.forgot.errInvalidEmail");
      } else if (code === "auth/too-many-requests") {
        msg = t("auth.forgot.errTooManyRequests");
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
    <div className="flex min-h-screen w-full items-center justify-center bg-yellow-300 px-4">
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
