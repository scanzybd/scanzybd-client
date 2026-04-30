import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import OrderTable from "../../../components/OrderTable";

const ShippedOrders = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["shipped-orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order/shipped");
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
      title="Shipped Orders"
      orders={orders}
      isLoading={isLoading}
      statusOptions={["shipped", "delivered", "returned", "cancelled"]}
      onStatusUpdate={handleStatusUpdate}
      statusUpdatingId={isStatusUpdating ? variables?.orderId || "" : ""}
    />
  );
};

export default ShippedOrders;
