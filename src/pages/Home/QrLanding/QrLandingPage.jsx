import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../../config/api";

/** Public QR scan page — must not redirect to dashboard (login required). */
const QrLandingPage = () => {
  const { code } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [phase, setPhase] = useState("loading"); // loading | ok | unassigned | not_found | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadQR = async () => {
      setPhase("loading");
      setErrorMessage("");
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/qr/code/${encodeURIComponent(code)}`
        );
        const { qr, vehicle: v } = res.data;

        if (cancelled) return;

        if (!qr?.isAssigned || qr.status !== "assigned" || !v) {
          setVehicle(null);
          setPhase("unassigned");
          return;
        }

        setVehicle(v);
        setPhase("ok");
      } catch (err) {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 404) {
          setPhase("not_found");
        } else {
          setPhase("error");
          setErrorMessage(
            err?.response?.data?.message ||
              err?.message ||
              "Could not load this QR code."
          );
        }
      }
    };

    if (code) loadQR();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const statusCard = ({ title, message, tone = "neutral", showCode = true, footer }) => {
    const toneClasses = {
      neutral: "border-slate-200 text-slate-800",
      warning: "border-amber-200 text-amber-900",
      danger: "border-red-200 text-red-900",
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div
          className={`w-full max-w-md rounded-3xl border bg-white p-7 shadow-sm ${toneClasses[tone] || toneClasses.neutral}`}
        >
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
          {showCode ? (
            <p className="mt-5 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
              Code: {code}
            </p>
          ) : null}
          {footer ? <div className="mt-5 border-t border-slate-100 pt-4">{footer}</div> : null}
        </div>
      </div>
    );
  };

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500" />
          <p className="mt-4 text-sm font-medium text-slate-700">Loading QR details...</p>
        </div>
      </div>
    );
  }

  if (phase === "not_found") {
    return statusCard({
      title: "QR not found",
      message: "This code is not registered in our system.",
      tone: "danger",
    });
  }

  if (phase === "error") {
    return statusCard({
      title: "Something went wrong",
      message: errorMessage,
      tone: "danger",
    });
  }

  if (phase === "unassigned") {
    return statusCard({
      title: "Not activated yet",
      message:
        "This QR code is not linked to a vehicle. The owner or an administrator must assign it first.",
      tone: "warning",
      footer: (
        <p className="text-xs text-slate-500">
          Staff can{" "}
          <Link
            to="/login"
            state={{ from: { pathname: `/dashboard/assign-vehicle/${code}` } }}
            className="font-semibold text-amber-700 underline decoration-amber-400 underline-offset-2"
          >
            sign in
          </Link>{" "}
          to assign this QR from the dashboard.
        </p>
      ),
    });
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
          <p className="text-xs uppercase tracking-wide text-slate-300">Emergency access</p>
          <h1 className="mt-2 text-2xl font-bold">Vehicle Contact</h1>
          <p className="mt-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
            QR ID: {code}
          </p>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Owner Contact</h2>
          <p className="mb-4 text-xs text-slate-500">Use this number to reach the vehicle owner.</p>

          <a
            href={`tel:${vehicle.ownerPhone}`}
            className="block rounded-xl bg-amber-400 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
          >
            📞 Call Owner
          </a>
        </div>

        {vehicle.driver ? (
          <div className="rounded-3xl border border-blue-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Driver Contact</h2>
            <p className="mb-4 text-xs text-slate-500">
              Contact the assigned driver directly if needed.
            </p>

            <a
              href={`tel:${vehicle.driver.phone}`}
              className="block rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              📞 Call Driver
            </a>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
            No driver assigned
          </div>
        )}
      </div>
    </div>
  );
};

export default QrLandingPage;
