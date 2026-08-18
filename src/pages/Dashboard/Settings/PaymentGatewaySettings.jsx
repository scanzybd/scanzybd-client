import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { CreditCard, QrCode, Save, Smartphone, Upload } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";
import { compressImageFileForUpload } from "../../../lib/compressImageForUpload";

const PaymentGatewaySettings = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [bkashEnabled, setBkashEnabled] = useState(true);
  const [sslEnabled, setSslEnabled] = useState(false);
  const [manualEnabled, setManualEnabled] = useState(false);
  const [defaultGateway, setDefaultGateway] = useState("bkash");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [merchantNumber, setMerchantNumber] = useState("");
  const [instructions, setInstructions] = useState("");
  const [uploadingQr, setUploadingQr] = useState(false);
  const [uploadError, setUploadError] = useState("");

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
    setManualEnabled(Boolean(data.manualBkash?.enabled));
    setDefaultGateway(data.defaultGateway || "bkash");
    setQrImageUrl(String(data.manualBkash?.qrImageUrl || ""));
    setMerchantNumber(String(data.manualBkash?.merchantNumber || ""));
    setInstructions(String(data.manualBkash?.instructions || ""));
  }, [data]);

  const hasAnyMethod = bkashEnabled || sslEnabled || manualEnabled;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!hasAnyMethod) {
        throw new Error("At least one payment method must stay enabled");
      }
      if (manualEnabled && !qrImageUrl.trim()) {
        throw new Error("Upload a bKash QR code before enabling manual payment");
      }
      const res = await axiosSecure.patch("/api/payment/admin/gateways", {
        bkash: { enabled: bkashEnabled },
        sslcommerz: { enabled: sslEnabled },
        manualBkash: {
          enabled: manualEnabled,
          qrImageUrl: qrImageUrl.trim(),
          merchantNumber: merchantNumber.trim(),
          instructions: instructions.trim(),
        },
        defaultGateway,
      });
      return res.data?.settings;
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(["admin-payment-gateways"], settings);
      queryClient.invalidateQueries({ queryKey: ["payment-gateways"] });
      Swal.fire("Saved", "Payment settings updated.", "success");
    },
    onError: (err) => {
      Swal.fire("Error", err?.response?.data?.message || err.message, "error");
    },
  });

  const tryToggleBkash = (next) => {
    if (!next && !sslEnabled && !manualEnabled) {
      Swal.fire("Not allowed", "At least one payment method must stay ON.", "warning");
      return;
    }
    setBkashEnabled(next);
    if (!next && defaultGateway === "bkash") setDefaultGateway("sslcommerz");
  };

  const tryToggleSsl = (next) => {
    if (!next && !bkashEnabled && !manualEnabled) {
      Swal.fire("Not allowed", "At least one payment method must stay ON.", "warning");
      return;
    }
    setSslEnabled(next);
    if (!next && defaultGateway === "sslcommerz") setDefaultGateway("bkash");
  };

  const tryToggleManual = (next) => {
    if (!next && !bkashEnabled && !sslEnabled) {
      Swal.fire("Not allowed", "At least one payment method must stay ON.", "warning");
      return;
    }
    if (next && !qrImageUrl.trim()) {
      Swal.fire(
        "QR required",
        "Upload your bKash QR image first, then turn manual payment ON.",
        "info"
      );
      return;
    }
    setManualEnabled(next);
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }

    setUploadError("");
    setUploadingQr(true);

    try {
      const dataUrl = await compressImageFileForUpload(file);
      const res = await axiosSecure.post("/api/upload/image", { image: dataUrl });
      const url = res.data?.url;
      if (!url) {
        throw new Error(res.data?.message || "No URL returned from upload");
      }

      setQrImageUrl(url);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Upload failed";
      setUploadError(
        /network error/i.test(msg)
          ? "Upload failed (file too large or connection). Try again."
          : msg
      );
    } finally {
      setUploadingQr(false);
    }
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
          bKash online, SSL Commerz, বা Manual bKash —{" "}
          <strong>৩টার যেকোনো একটি ON</strong> থাকলেই checkout চলবে। সব OFF করা
          যাবে না।
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <label className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
            <Smartphone className="h-5 w-5 text-rose-600" />
            bKash (online)
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
              Default online gateway when both are on
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

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
            <QrCode className="h-5 w-5 text-sky-600" />
            bKash (manual — QR)
          </span>
          <input
            type="checkbox"
            className="toggle toggle-info"
            checked={manualEnabled}
            onChange={(e) => tryToggleManual(e.target.checked)}
          />
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Upload your bKash payment QR. Customers scan it at checkout and enter their
          transaction ID ({4}–{30} characters, letters or numbers).
        </p>

        <div className="flex flex-col items-start gap-4 sm:flex-row">
          {qrImageUrl ? (
            <img
              src={qrImageUrl}
              alt="bKash QR preview"
              className="h-40 w-40 rounded-xl border border-slate-200 object-contain dark:border-slate-700"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 dark:border-slate-600">
              No QR uploaded
            </div>
          )}

          <label className="btn btn-outline gap-2 rounded-xl">
            <Upload className="h-4 w-4" />
            {uploadingQr ? "Uploading…" : qrImageUrl ? "Replace QR" : "Upload QR"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingQr}
              onChange={handleQrUpload}
            />
          </label>
        </div>

        {uploadError ? (
          <p className="text-sm text-rose-600 dark:text-rose-400">{uploadError}</p>
        ) : null}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            bKash number (optional)
          </span>
          <input
            type="text"
            value={merchantNumber}
            onChange={(e) => setMerchantNumber(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="input input-bordered w-full rounded-xl"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Instructions for customer (optional)
          </span>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            placeholder="Send exact amount via bKash, then enter your transaction ID"
            className="textarea textarea-bordered w-full rounded-xl"
          />
        </label>
      </div>

      <button
        type="button"
        className="btn gap-2 rounded-xl border-none bg-amber-500 font-semibold text-slate-900 hover:bg-amber-600"
        disabled={saveMutation.isPending || uploadingQr}
        onClick={() => saveMutation.mutate()}
      >
        <Save className="h-4 w-4" />
        {saveMutation.isPending ? "Saving…" : "Save settings"}
      </button>

      <p className="text-xs text-slate-500">
        Online API keys stay in server <code className="text-xs">.env</code> (BKASH_*,
        SSLCOMMERZ_*). Manual bKash QR is saved here and shown at checkout.
      </p>
    </div>
  );
};

export default PaymentGatewaySettings;
