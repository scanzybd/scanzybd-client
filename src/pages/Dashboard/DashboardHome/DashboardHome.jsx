import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Car,
  Package,
  ShoppingCart,
  CheckCircle,
  BadgeDollarSign,
  ArrowRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function greetingLabel() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Simple SVG line chart — values 0..max */
function LineChartCard({ title, subtitle, values, labels }) {
  const max = Math.max(...values, 1);
  const w = 100;
  const h = 48;
  const pad = 4;
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(values.length - 1, 1);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  const area = `0,${h} ${pts.join(" ")} ${w},${h}`;

  return (
    <div className="flex h-full min-h-[280px] flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          This year
        </span>
      </div>
      <div className="relative flex-1 rounded-xl bg-gradient-to-b from-emerald-50/80 to-transparent px-2 pt-2">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-36 w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon fill="url(#lineFill)" points={area} />
          <polyline
            fill="none"
            stroke="rgb(16 185 129)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={pts.join(" ")}
          />
        </svg>
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          {labels.map((lb, i) => (
            <span key={i}>{lb}</span>
          ))}
        </div>
      </div>
      <Link
        to="/dashboard/finance-management"
        className="btn btn-block mt-4 gap-2 rounded-xl border-0 bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600"
      >
        More detail
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function BarChartCard({ title, values, dayLabels }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex min-h-[280px] flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">Last 7 days · orders</p>
        </div>
        <div className="flex -space-x-2">
          {["bg-emerald-400", "bg-emerald-500", "bg-teal-500"].map((c, i) => (
            <div
              key={i}
              className={`h-8 w-8 rounded-full border-2 border-white ${c}`}
            />
          ))}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold text-slate-600">
            +{Math.max(0, values.reduce((a, b) => a + b, 0) - 3)}
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-end justify-between gap-1 border-b border-slate-100 pb-1 pt-4">
        {values.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full max-w-[2rem] rounded-t-md bg-gradient-to-t from-emerald-600/90 to-emerald-400/80 transition-all"
              style={{ height: `${Math.max(8, (v / max) * 120)}px` }}
              title={`${v} orders`}
            />
            <span className="text-[10px] text-slate-400">{dayLabels[i]}</span>
          </div>
        ))}
      </div>
      <Link
        to="/dashboard/all-orders"
        className="btn btn-block mt-4 gap-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 hover:bg-slate-50"
      >
        More detail
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

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
      const res = await axiosSecure.get("/api/products/mine");
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!userRole,
  });

  const loading = ordersLoading || vehiclesLoading || productsLoading;
  const hasError = ordersError || vehiclesError || productsError;

  const vehicles = useMemo(
    () => (Array.isArray(vehiclesResponse?.data) ? vehiclesResponse.data : []),
    [vehiclesResponse]
  );

  const chartData = useMemo(() => {
    const monthly = Array(12).fill(0);
    const last7 = Array(7).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() - (6 - i));
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);
      orders.forEach((o) => {
        const d = o.createdAt ? new Date(o.createdAt) : null;
        if (!d || Number.isNaN(d.getTime())) return;
        if (d >= dayStart && d < dayEnd) last7[i] += 1;
      });
    }

    orders.forEach((o) => {
      const d = o.createdAt ? new Date(o.createdAt) : null;
      if (!d || Number.isNaN(d.getTime())) return;
      monthly[d.getMonth()] += Number(o.totalAmount || 0);
    });

    return { monthly, last7 };
  }, [orders]);

  const analytics = useMemo(() => {
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalVehicles = vehicles.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order?.totalAmount || 0),
      0
    );
    const paidOrders = orders.filter((o) => o?.paymentStatus === "paid").length;
    const pendingOrders = orders.filter((o) => o?.status === "pending").length;
    const completedOrders = orders.filter(
      (o) => o?.status === "paid" || o?.status === "completed"
    ).length;

    return {
      totalOrders,
      totalProducts,
      totalVehicles,
      totalRevenue,
      completedOrders,
      pendingOrders,
      paidOrders,
      recentOrders: [...orders].slice(0, 6),
    };
  }, [orders, products, vehicles]);

  const paidRate =
    analytics.totalOrders > 0
      ? Math.round((analytics.paidOrders / analytics.totalOrders) * 100)
      : 0;

  const last7Labels = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push(DAYS[d.getDay()]);
    }
    return out;
  }, []);

  if (loading) {
    return <SmartLoader fullPage label="Loading analytics..." />;
  }

  if (hasError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        Failed to load analytics. Please refresh.
      </div>
    );
  }

  const name = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {greetingLabel()}, {name}!
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Here&apos;s what&apos;s happening with your store ·{" "}
            <span className="font-medium text-emerald-600">{userRole}</span>
          </p>
        </div>
      </div>

      {/* KPI row — 3 cards like reference */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Orders</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
                {analytics.totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <ShoppingCart size={22} />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-emerald-600">
            +{paidRate}% paid vs total
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Revenue</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
                ৳ {analytics.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <BadgeDollarSign size={22} />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-emerald-600">
            From all recorded orders
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
                {analytics.pendingOrders}
              </p>
            </div>
            <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
              <Clock size={22} />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-rose-600">
            {analytics.pendingOrders > 0 ? "Needs attention" : "All clear"}
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LineChartCard
            title="Revenue overview"
            subtitle="Sum of order amounts by month (current data)"
            values={chartData.monthly}
            labels={MONTHS}
          />
        </div>
        <div className="lg:col-span-2">
          <BarChartCard title="Order activity" values={chartData.last7} dayLabels={last7Labels} />
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Products", value: analytics.totalProducts, icon: Package, href: "/dashboard/all-products" },
          { label: "Vehicles", value: analytics.totalVehicles, icon: Car, href: "/dashboard/all-vehicles" },
          { label: "Completed", value: analytics.completedOrders, icon: CheckCircle, href: "/dashboard/completed-orders" },
          { label: "Paid orders", value: analytics.paidOrders, icon: TrendingUp, href: "/dashboard/all-orders" },
        ].map((row) => {
          const Icon = row.icon;
          return (
            <Link
              key={row.label}
              to={row.href}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{row.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{row.value}</p>
              </div>
              <Icon className="h-10 w-10 text-emerald-500 opacity-80 transition group-hover:scale-105" />
            </Link>
          );
        })}
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent orders</h2>
            <Link to="/dashboard/all-orders" className="text-sm font-medium text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="pb-2 font-semibold">ID</th>
                  <th className="pb-2 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-slate-500">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  analytics.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-slate-100 text-sm">
                      <td className="py-2 font-mono text-xs text-slate-600">
                        …{String(order._id).slice(-8)}
                      </td>
                      <td className="py-2 font-medium tabular-nums">
                        ৳ {Number(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-2">
                        <span className="badge badge-sm border-0 bg-slate-100 text-slate-700">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Quick snapshot</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600">Catalog products</span>
              <span className="font-semibold text-slate-900">{analytics.totalProducts}</span>
            </li>
            <li className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600">Fleet / vehicles</span>
              <span className="font-semibold text-slate-900">{analytics.totalVehicles}</span>
            </li>
            <li className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600">Open pending orders</span>
              <span className="font-semibold text-amber-700">{analytics.pendingOrders}</span>
            </li>
            <li className="flex justify-between pt-1">
              <span className="text-slate-600">Payment success focus</span>
              <span className="font-semibold text-emerald-600">{paidRate}%</span>
            </li>
          </ul>
          <Link
            to="/dashboard/order-reports"
            className="btn btn-block mt-6 gap-2 rounded-xl border-0 bg-slate-900 text-white hover:bg-slate-800"
          >
            Reports
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
