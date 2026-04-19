import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Car,
  Package,
  ShoppingCart,
  CheckCircle,
  BadgeDollarSign,
} from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";

const DashboardHome = () => {
  const axiosSecure = useAxiosSecure();
  const { user, userRole } = useAuth();

  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
  } = useQuery({
    queryKey: ["dashboard-analytics-orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order");
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!userRole,
  });

  const {
    data: vehiclesResponse,
    isLoading: vehiclesLoading,
    isError: vehiclesError,
  } = useQuery({
    queryKey: ["dashboard-analytics-vehicles"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/vehicle");
      return res.data;
    },
    enabled: !!userRole,
  });

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["dashboard-analytics-products"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/products");
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!userRole,
  });

  const loading = ordersLoading || vehiclesLoading || productsLoading;
  const hasError = ordersError || vehiclesError || productsError;

  const vehicles = useMemo(
    () =>
      Array.isArray(vehiclesResponse?.data) ? vehiclesResponse.data : [],
    [vehiclesResponse]
  );

  const analytics = useMemo(() => {
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalVehicles = vehicles.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order?.totalAmount || 0),
      0
    );
    const paidOrders = orders.filter(
      (order) => order?.paymentStatus === "paid"
    ).length;
    const completedOrders = orders.filter(
      (order) => order?.status === "completed" || order?.status === "paid"
    ).length;
    const pendingOrders = orders.filter(
      (order) => order?.status === "pending"
    ).length;
    const paymentSuccessRate =
      totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0;

    return {
      totalOrders,
      totalProducts,
      totalVehicles,
      totalRevenue,
      completedOrders,
      pendingOrders,
      paymentSuccessRate,
      recentOrders: [...orders].slice(0, 5),
    };
  }, [orders, products, vehicles]);

  const statCards = [
    {
      title: "Total Orders",
      value: analytics.totalOrders,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Vehicles",
      value: analytics.totalVehicles,
      icon: Car,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Total Products",
      value: analytics.totalProducts,
      icon: Package,
      color: "text-violet-600",
      bg: "bg-violet-100",
    },
    {
      title: "Completed Orders",
      value: analytics.completedOrders,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Revenue",
      value: `৳ ${analytics.totalRevenue.toLocaleString()}`,
      icon: BadgeDollarSign,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Payment Success",
      value: `${analytics.paymentSuccessRate}%`,
      icon: CheckCircle,
      color: "text-teal-600",
      bg: "bg-teal-100",
    },
  ];

  if (loading) {
    return <SmartLoader fullPage label="Loading analytics from database..." />;
  }

  if (hasError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        Failed to load analytics data. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome, {user?.displayName || user?.email || "User"} ({userRole || "user"})
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.title}</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">{item.value}</h2>
                </div>
                <div className={`rounded-xl p-3 ${item.bg}`}>
                  <Icon className={item.color} size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
        <p className="mb-4 mt-1 text-sm text-slate-500">
          Latest 5 orders from database.
        </p>

        {analytics.recentOrders.length === 0 ? (
          <p className="text-sm text-slate-500">No recent orders available.</p>
        ) : (
          <div className="space-y-3">
            {analytics.recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="truncate text-sm font-medium text-slate-700">
                  {order?._id}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-white px-2 py-1 text-slate-700">
                    ৳ {Number(order?.totalAmount || 0).toLocaleString()}
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">
                    {order?.status || "unknown"}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                    {order?.paymentStatus || "unknown"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;