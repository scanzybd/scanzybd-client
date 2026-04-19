import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import OrderTable from "../../../components/OrderTable";

const PendingOrders = () => {
  const axiosSecure = useAxiosSecure();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["pending-orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order/pending");
      return res.data;
    },
  });

  return <OrderTable title="Pending Orders" orders={orders} isLoading={isLoading} />;
};

export default PendingOrders;