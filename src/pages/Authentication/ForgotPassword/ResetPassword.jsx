import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmUserPasswordReset, verifyUserPasswordResetCode } = useAuth();

  const email = useMemo(
    () => location.state?.email || sessionStorage.getItem("fp_email") || "",
    [location.state]
  );
  const code = useMemo(
    () => location.state?.code || sessionStorage.getItem("fp_code") || "",
    [location.state]
  );
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    if (!email || !code) return;
    setSubmitting(true);
    try {
      await verifyUserPasswordResetCode(email, code);
      await confirmUserPasswordReset(email, code, data.newPassword);
      try {
        sessionStorage.removeItem("fp_email");
        sessionStorage.removeItem("fp_code");
      } catch {
        /* ignore */
      }
      await Swal.fire({
        icon: "success",
        title: t("auth.reset.successTitle"),
        text: t("auth.reset.successText"),
        confirmButtonText: t("auth.reset.login"),
      });
      navigate("/login", { replace: true });
    } catch (err) {
      const errCode = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      let msg = serverMsg || t("auth.reset.errReset");
      if (!err?.response) msg = "Server unreachable. Start backend and database first.";
      if (errCode === 410 || errCode === 404) msg = t("auth.reset.errInvalidLink");
      await Swal.fire({
        icon: "error",
        title: t("auth.reset.failed"),
        text: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!email || !code) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-4 transition-colors dark:bg-slate-950">
        <div className="card w-full max-w-sm bg-base-100 shadow-2xl">
          <div className="card-body text-center">
            <h1 className="text-xl font-bold">{t("auth.reset.invalidTitle")}</h1>
            <p className="text-sm text-gray-600">{t("auth.reset.invalidBody")}</p>
            <Link to="/forgotPassword" className="btn btn-primary btn-block mt-2">
              {t("auth.reset.forgotMenu")}
            </Link>
            <Link to="/login" className="btn btn-ghost btn-block btn-sm">
              {t("auth.reset.backLogin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-4 transition-colors dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="card bg-base-100 shadow-2xl">
          <div className="space-y-1 px-6 pt-6 text-center">
            <h1 className="text-3xl font-bold">{t("auth.reset.pageTitle")}</h1>
            <p className="text-gray-600">{t("auth.reset.setNew")}</p>
            <p className="break-all text-sm font-medium text-indigo-800">{email}</p>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label font-medium">New Password</label>
                <input
                  type="password"
                  placeholder="New Password"
                  autoComplete="new-password"
                  className="input input-bordered w-full"
                  disabled={submitting}
                  {...register("newPassword", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Minimum 6 characters required",
                    },
                  })}
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label font-medium">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  className="input input-bordered w-full"
                  disabled={submitting}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block mt-2"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  t("auth.reset.resetBtn")
                )}
              </button>

              <div className="text-center">
                <Link to="/login" className="link link-hover text-sm text-lime-800">
                  {t("auth.reset.backLogin")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
