import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import OrderTable from "../../../components/OrderTable";

const CompletedOrders = () => {
  const axiosSecure = useAxiosSecure();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["completed-orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order/completed");
      return res.data;
    },
  });

  return <OrderTable title="Completed Orders" orders={orders} isLoading={isLoading} />;
};

export default CompletedOrders;