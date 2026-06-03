import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { downloadOrderInvoice } from "../lib/orderInvoicePdf";

export default function InvoiceDownloadButton({
  order,
  payment = null,
  customer = {},
  className = "btn btn-outline btn-sm gap-1.5 whitespace-nowrap rounded-xl",
  label = "Download Invoice",
}) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      downloadOrderInvoice(order, payment, customer);
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Download failed",
        text: err?.message || "Could not generate invoice.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={className}
      disabled={busy || !order}
      onClick={handleClick}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}
