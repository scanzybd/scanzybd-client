import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import OrderTable from "../../../components/OrderTable";

const ReturnedOrders = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["returned-orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order/returned");
      return res.data;
    },
  });

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

  const handleStatusUpdate = async (order, status) => {
    await mutateStatus({ orderId: order?._id, status });
  };

  return (
    <OrderTable
      title="Returned Orders"
      orders={orders}
      isLoading={isLoading}
      statusOptions={["returned", "shipped", "delivered", "cancelled"]}
      onStatusUpdate={handleStatusUpdate}
      statusUpdatingId={isStatusUpdating ? variables?.orderId || "" : ""}
    />
  );
};

export default ReturnedOrders;
