import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { CreditCard, Smartphone, Save } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";

const PaymentGatewaySettings = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [bkashEnabled, setBkashEnabled] = useState(true);
  const [sslEnabled, setSslEnabled] = useState(false);
  const [defaultGateway, setDefaultGateway] = useState("bkash");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payment-gateways"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/payment/admin/gateways");
      return res.data?.settings;
    },
  });

  useEffect(() => {
    if (!data) return;
    setBkashEnabled(Boolean(data.bkash?.enabled));
    setSslEnabled(Boolean(data.sslcommerz?.enabled));
    setDefaultGateway(data.defaultGateway || "bkash");
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!bkashEnabled && !sslEnabled) {
        throw new Error("At least one gateway must stay enabled");
      }
      const res = await axiosSecure.patch("/api/payment/admin/gateways", {
        bkash: { enabled: bkashEnabled },
        sslcommerz: { enabled: sslEnabled },
        defaultGateway,
      });
      return res.data?.settings;
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(["admin-payment-gateways"], settings);
      queryClient.invalidateQueries({ queryKey: ["payment-gateways"] });
      Swal.fire("Saved", "Payment gateway settings updated.", "success");
    },
    onError: (err) => {
      Swal.fire("Error", err?.response?.data?.message || err.message, "error");
    },
  });

  const tryToggleBkash = (next) => {
    if (!next && !sslEnabled) {
      Swal.fire("Not allowed", "At least one gateway must stay ON.", "warning");
      return;
    }
    setBkashEnabled(next);
    if (!next && defaultGateway === "bkash") setDefaultGateway("sslcommerz");
  };

  const tryToggleSsl = (next) => {
    if (!next && !bkashEnabled) {
      Swal.fire("Not allowed", "At least one gateway must stay ON.", "warning");
      return;
    }
    setSslEnabled(next);
    if (!next && defaultGateway === "sslcommerz") setDefaultGateway("bkash");
  };

  if (isLoading) {
    return <SmartLoader fullPage label="Loading payment settings…" />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Payment gateways
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Enable bKash and/or SSL Commerz for customer checkout. At least one must
          stay ON.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <label className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
            <Smartphone className="h-5 w-5 text-rose-600" />
            bKash
          </span>
          <input
            type="checkbox"
            className="toggle toggle-warning"
            checked={bkashEnabled}
            onChange={(e) => tryToggleBkash(e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
            <CreditCard className="h-5 w-5 text-emerald-700" />
            SSL Commerz
          </span>
          <input
            type="checkbox"
            className="toggle toggle-success"
            checked={sslEnabled}
            onChange={(e) => tryToggleSsl(e.target.checked)}
          />
        </label>

        {bkashEnabled && sslEnabled ? (
          <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Default when both are on
            </p>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="defaultGw"
                  checked={defaultGateway === "bkash"}
                  onChange={() => setDefaultGateway("bkash")}
                  className="radio radio-sm radio-warning"
                />
                bKash
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="defaultGw"
                  checked={defaultGateway === "sslcommerz"}
                  onChange={() => setDefaultGateway("sslcommerz")}
                  className="radio radio-sm radio-success"
                />
                SSL Commerz
              </label>
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="btn gap-2 rounded-xl border-none bg-amber-500 font-semibold text-slate-900 hover:bg-amber-600"
        disabled={saveMutation.isPending}
        onClick={() => saveMutation.mutate()}
      >
        <Save className="h-4 w-4" />
        {saveMutation.isPending ? "Saving…" : "Save settings"}
      </button>

      <p className="text-xs text-slate-500">
        API keys stay in server <code className="text-xs">.env</code> (BKASH_*,
        SSLCOMMERZ_*). This page only toggles which gateway customers see.
      </p>
    </div>
  );
};

export default PaymentGatewaySettings;
