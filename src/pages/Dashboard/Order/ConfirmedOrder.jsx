import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import OrderTable from "../../../components/OrderTable";

const ConfirmedOrder = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [labelPreviewUrl, setLabelPreviewUrl] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["confirmed-orders", fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const query = params.toString();
      const res = await axiosSecure.get(`/api/order/completed${query ? `?${query}` : ""}`);
      return res.data;
    },
  });

  const safeOrders = useMemo(
    () => (Array.isArray(orders) ? orders : []),
    [orders]
  );

  const { mutateAsync: mutateStatus, isPending: isStatusUpdating, variables } = useMutation({
    mutationFn: async ({ orderId, status }) =>
      axiosSecure.patch(`/api/order/${orderId}/status`, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["confirmed-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["shipped-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["returned-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["delivered-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["all-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["order-reports"] });
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const buildLabelPdf = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const labelW = 70;
    const labelH = 40;
    const cols = 3;
    const rows = 7;
    const perPage = cols * rows; // 21 labels per page

    safeOrders.forEach((order, index) => {
      if (index > 0 && index % perPage === 0) doc.addPage();
      const slot = index % perPage;
      const col = slot % cols;
      const row = Math.floor(slot / cols);
      const x = col * labelW;
      const y = row * labelH;

      const createdAt = order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A";
      const shipping = order?.shippingAddress || {};
      const lines = [

        `Order No: ${order?.orderNo || "-"}`,
        `Date: ${createdAt}`,
        `Name: ${shipping.fullName || "-"}`,
        `Phone: ${shipping.phone || "-"}`,
        `Addr: ${shipping.city || "-"}, ${shipping.district || "-"}`,
        `Details: ${shipping.line1 || "-"}`,
      ];

      doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text("DELIVERY DETAILS", x + 1, y + 5);


doc.setFont("helvetica", "normal");
doc.setFontSize(10);

let textY = y + 12;
const lineHeight = 4.2;

lines.forEach((line) => {
  const wrapped = doc.splitTextToSize(line, labelW - 2);

  wrapped.forEach((wLine) => {
    if (textY <= y + labelH - 2) {
      doc.text(wLine, x + 1, textY);
      textY += lineHeight;
    }
  });
});

      // Optional crop guide border for cut marks
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.rect(x, y, labelW, labelH);
    });

    return doc;
  };

  const handlePreviewLabels = () => {
    if (labelPreviewUrl) URL.revokeObjectURL(labelPreviewUrl);
    const pdf = buildLabelPdf();
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    setLabelPreviewUrl(url);
  };

  const handleDownloadLabels = () => {
    const pdf = buildLabelPdf();
    pdf.save(`confirmed-delivery-labels-${fromDate || "all"}-${toDate || "all"}.pdf`);
  };

  const closePreview = () => {
    if (labelPreviewUrl) URL.revokeObjectURL(labelPreviewUrl);
    setLabelPreviewUrl("");
  };

  const handleStatusUpdate = async (order, status) => {
    await mutateStatus({ orderId: order?._id, status });
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">From Date</span>
              <input
                type="date"
                className="input input-bordered input-sm w-full"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">To Date</span>
              <input
                type="date"
                className="input input-bordered input-sm w-full"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-sm" onClick={handlePrint}>
              Print (Date Wise)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handlePreviewLabels}
              disabled={safeOrders.length === 0}
            >
              Preview Delivery Label
            </button>
            <button
              type="button"
              className="btn btn-sm btn-accent"
              onClick={handleDownloadLabels}
              disabled={safeOrders.length === 0}
            >
              Download Delivery Label
            </button>
          </div>
        </div>
      </div>

      <OrderTable
        title="Confirmed Orders"
        orders={safeOrders}
        isLoading={isLoading}
        statusOptions={["confirmed", "shipped", "delivered", "returned", "cancelled"]}
        onStatusUpdate={handleStatusUpdate}
        statusUpdatingId={isStatusUpdating ? variables?.orderId || "" : ""}
      />

      {labelPreviewUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-3">
              <h3 className="text-sm font-semibold text-slate-800">Delivery Label Preview</h3>
              <div className="flex items-center gap-2">
                <button type="button" className="btn btn-sm btn-primary" onClick={handleDownloadLabels}>
                  Download PDF
                </button>
                <button type="button" className="btn btn-sm" onClick={closePreview}>
                  Close
                </button>
              </div>
            </div>
            <iframe title="Delivery Label Preview" src={labelPreviewUrl} className="h-full w-full" />
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ConfirmedOrder;
