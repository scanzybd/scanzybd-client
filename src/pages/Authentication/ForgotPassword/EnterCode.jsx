import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation, Trans } from "react-i18next";
import Swal from "sweetalert2";
import { Mail } from "lucide-react";
import useAuth from "../../../hooks/useAuth";

const EnterCode = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { sendUserPasswordResetEmail } = useAuth();
  const email = location.state?.email || "";
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      await Swal.fire({
        icon: "info",
        title: t("auth.enterCode.noEmailTitle"),
        text: t("auth.enterCode.noEmailText"),
      });
      navigate("/forgotPassword", { replace: true });
      return;
    }
    setResending(true);
    try {
      await sendUserPasswordResetEmail(email);
      await Swal.fire({
        icon: "success",
        title: t("auth.enterCode.resentTitle"),
        text: t("auth.enterCode.resentText"),
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: t("auth.enterCode.failedTitle"),
        text: err?.message || t("auth.enterCode.failedSend"),
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-100 px-4 transition-colors dark:bg-slate-950">
      <div className="card w-full max-w-sm bg-base-100 shadow-2xl">
        <div className="px-6 pt-6">
          <div className="mb-3 flex justify-center">
            <div className="rounded-full bg-amber-100 p-4">
              <Mail className="h-10 w-10 text-amber-700" />
            </div>
          </div>
          <h1 className="mb-2 text-center text-3xl font-bold">
            {t("auth.enterCode.heading")}
          </h1>
          <p className="text-center text-sm text-gray-600">
            <Trans
              i18nKey="auth.enterCode.body"
              components={{ strong: <strong /> }}
            />
          </p>
          {email && (
            <p className="mt-3 break-all text-center text-sm font-medium text-indigo-800">
              {email}
            </p>
          )}
        </div>

        <div className="card-body space-y-3">
          <p className="text-xs text-gray-500">{t("auth.enterCode.note")}</p>

          <button
            type="button"
            className="btn btn-block border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              t("auth.enterCode.resend")
            )}
          </button>

          <Link
            to="/login"
            className="btn btn-block btn-ghost border border-base-300"
          >
            {t("auth.enterCode.backLogin")}
          </Link>

          <Link
            to="/forgotPassword"
            className="btn btn-link btn-sm text-center text-gray-600 no-underline"
          >
            {t("auth.enterCode.otherEmail")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnterCode;
