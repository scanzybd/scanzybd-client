import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import OrderTable from "../../../components/OrderTable";

const CancelledOrders = () => {
  const axiosSecure = useAxiosSecure();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["cancelled-orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order/cancelled");
      return res.data;
    },
  });

  return <OrderTable title="Cancelled Orders" orders={orders} isLoading={isLoading} />;
};

export default CancelledOrders;