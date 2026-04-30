import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import OrderTable from "../../../components/OrderTable";

const AllOrders = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order");
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
      await queryClient.invalidateQueries({ queryKey: ["all-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["confirmed-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["shipped-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["delivered-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["returned-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["order-reports"] });
    },
  });

  const summaryCards = useMemo(() => {
    const totalOrders = safeOrders.length;
    const revenue = safeOrders.reduce((sum, order) => sum + Number(order?.totalAmount || 0), 0);
    const confirmed = safeOrders.filter((o) => ["confirmed", "paid"].includes(String(o?.status || "").toLowerCase())).length;
    const shipped = safeOrders.filter((o) => String(o?.status || "").toLowerCase() === "shipped").length;
    const delivered = safeOrders.filter((o) => String(o?.status || "").toLowerCase() === "delivered").length;
    const returned = safeOrders.filter((o) => String(o?.status || "").toLowerCase() === "returned").length;

    return [
      { label: "Total Orders", value: totalOrders, valueClass: "text-slate-900" },
      { label: "Revenue", value: `৳ ${revenue.toLocaleString()}`, valueClass: "text-slate-900" },
      { label: "Confirmed", value: confirmed, valueClass: "text-emerald-600" },
      { label: "Shipped", value: shipped, valueClass: "text-sky-600" },
      { label: "Delivered", value: delivered, valueClass: "text-teal-600" },
      { label: "Returned", value: returned, valueClass: "text-orange-600" },
    ];
  }, [safeOrders]);

  const handleStatusUpdate = async (order, status) => {
    await mutateStatus({ orderId: order?._id, status });
  };

  return (
    <OrderTable
      title="All Orders"
      orders={safeOrders}
      isLoading={isLoading}
      summaryCards={summaryCards}
      statusOptions={["pending", "confirmed", "shipped", "delivered", "returned", "cancelled"]}
      onStatusUpdate={handleStatusUpdate}
      statusUpdatingId={isStatusUpdating ? variables?.orderId || "" : ""}
    />
  );
};

export default AllOrders;