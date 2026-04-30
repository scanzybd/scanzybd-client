import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import OrderTable from "../../../components/OrderTable";

const DeliveredOrders = () => {
  const axiosSecure = useAxiosSecure();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["delivered-orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order/delivered");
      return res.data;
    },
  });

  return <OrderTable title="Delivered Orders" orders={orders} isLoading={isLoading} />;
};

export default DeliveredOrders;
