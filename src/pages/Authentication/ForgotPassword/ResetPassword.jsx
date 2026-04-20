import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

function readOobCode() {
  try {
    const u = new URL(window.location.href);
    let c = u.searchParams.get("oobCode");
    if (c) return c;
    if (u.hash && u.hash.length > 1) {
      const raw = u.hash.slice(1);
      const queryPart = raw.includes("?")
        ? raw.split("?").slice(1).join("?")
        : raw;
      c = new URLSearchParams(queryPart).get("oobCode");
      if (c) return c;
    }
  } catch {
    /* ignore */
  }
  return null;
}

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmUserPasswordReset, verifyUserPasswordResetCode } = useAuth();

  const [oobCode, setOobCode] = useState(
    () => searchParams.get("oobCode") || readOobCode()
  );
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [codeError, setCodeError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");

  useEffect(() => {
    const code = searchParams.get("oobCode") || readOobCode();
    setOobCode(code);
    if (!code) {
      setChecking(false);
      setCodeError("no-code");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const email = await verifyUserPasswordResetCode(code);
        if (!cancelled) {
          setVerifiedEmail(email);
          setCodeError("");
        }
      } catch (err) {
        if (!cancelled) {
          setCodeError(err?.code || "invalid-or-expired");
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, verifyUserPasswordResetCode]);

  const onSubmit = async (data) => {
    if (!oobCode) return;
    setSubmitting(true);
    try {
      await confirmUserPasswordReset(oobCode, data.newPassword);
      await Swal.fire({
        icon: "success",
        title: t("auth.reset.successTitle"),
        text: t("auth.reset.successText"),
        confirmButtonText: t("auth.reset.login"),
      });
      navigate("/login", { replace: true });
    } catch (err) {
      const code = err?.code || "";
      let msg = t("auth.reset.errReset");
      if (code === "auth/weak-password") {
        msg = t("auth.reset.errWeak");
      } else if (
        code === "auth/invalid-action-code" ||
        code === "auth/expired-action-code"
      ) {
        msg = t("auth.reset.errInvalidLink");
      }
      await Swal.fire({
        icon: "error",
        title: t("auth.reset.failed"),
        text: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-4 transition-colors dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-base-100 px-8 py-10 shadow-xl">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-sm text-gray-600">{t("auth.reset.verifying")}</p>
        </div>
      </div>
    );
  }

  if (codeError === "no-code" || !oobCode) {
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

  if (codeError && codeError !== "no-code") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-4 transition-colors dark:bg-slate-950">
        <div className="card w-full max-w-sm bg-base-100 shadow-2xl">
          <div className="card-body text-center">
            <h1 className="text-xl font-bold text-rose-700">
              {t("auth.reset.expiredTitle")}
            </h1>
            <p className="text-sm text-gray-600">{t("auth.reset.expiredBody")}</p>
            <Link to="/forgotPassword" className="btn btn-primary btn-block mt-2">
              {t("auth.reset.tryAgain")}
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
            {verifiedEmail && (
              <p className="break-all text-sm font-medium text-indigo-800">
                {verifiedEmail}
              </p>
            )}
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
