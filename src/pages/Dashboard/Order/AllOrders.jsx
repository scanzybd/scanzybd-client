import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import OrderTable from "../../../components/OrderTable";

const AllOrders = () => {
  const axiosSecure = useAxiosSecure();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order");
      return res.data;
    },
  });

  return <OrderTable title="All Orders" orders={orders} isLoading={isLoading} />;
};

export default AllOrders;