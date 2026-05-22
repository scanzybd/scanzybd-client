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
  Wallet,
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

function LineChartCard({ title, subtitle, values, labels, detailHref }) {
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
          Paid only
        </span>
      </div>
      <div className="relative flex-1 rounded-xl bg-gradient-to-b from-emerald-50/80 to-transparent px-2 pt-2">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full overflow-visible" preserveAspectRatio="none">
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
        to={detailHref}
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
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <div className="flex min-h-[280px] flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">Last 7 days · {total} orders</p>
        </div>
      </div>
      <div className="flex flex-1 items-end justify-between gap-1 border-b border-slate-100 pb-1 pt-4">
        {values.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full max-w-[2rem] rounded-t-md bg-gradient-to-t from-emerald-600/90 to-emerald-400/80"
              style={{ height: `${Math.max(8, (v / max) * 120)}px` }}
              title={`${v} orders`}
            />
            <span className="text-[10px] text-slate-400">{dayLabels[i]}</span>
          </div>
        ))}
      </div>
      <Link
        to="/dashboard/orders"
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
  const isAdmin = userRole === "admin";
  const isProvider = userRole === "provider";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-analytics", userRole],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order/dashboard-analytics");
      return res.data;
    },
    enabled: Boolean(userRole),
    staleTime: 30_000,
  });

  const last7Labels = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push(DAYS[d.getDay()]);
    }
    return out;
  }, []);

  const paidRate =
    data && data.totalOrders > 0
      ? Math.round((data.paidOrders / data.totalOrders) * 100)
      : 0;

  const financeHref = isProvider ? "/dashboard/provider-finance" : "/dashboard/finance-management";

  if (isLoading) {
    return <SmartLoader fullPage label="Loading analytics..." />;
  }

  if (isError || !data?.success) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        Failed to load analytics. Please refresh.
      </div>
    );
  }

  const name = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const scopeNote = isProvider
    ? "Orders you created · paid sales & unsettled earnings"
    : "All store orders";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {greetingLabel()}, {name}!
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {scopeNote} · <span className="font-medium text-emerald-600">{userRole}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {isProvider ? "My orders" : "Orders"}
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
                {data.totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <ShoppingCart size={22} />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-emerald-600">
            {data.paidOrders} paid · {paidRate}% of total
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Paid revenue</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
                ৳ {Number(data.paidRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <BadgeDollarSign size={22} />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500">
            {isProvider ? "From your paid orders" : "Paid orders only"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {isProvider ? "Unsettled" : "Pending"}
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
                {isProvider
                  ? `৳ ${Number(data.unsettledEarnings || 0).toLocaleString()}`
                  : data.pendingOrders}
              </p>
            </div>
            <div
              className={`rounded-xl p-3 ${
                isProvider ? "bg-violet-50 text-violet-600" : "bg-rose-50 text-rose-600"
              }`}
            >
              {isProvider ? <Wallet size={22} /> : <Clock size={22} />}
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-600">
            {isProvider ? (
              <Link to={financeHref} className="text-violet-700 hover:underline">
                Request settlement →
              </Link>
            ) : data.pendingOrders > 0 ? (
              <span className="text-rose-600">Needs attention</span>
            ) : (
              "All clear"
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LineChartCard
            title={isProvider ? "My paid sales" : "Paid revenue"}
            subtitle="Monthly total from paid orders"
            values={data.monthly || []}
            labels={MONTHS}
            detailHref={financeHref}
          />
        </div>
        <div className="lg:col-span-2">
          <BarChartCard
            title={isProvider ? "My order activity" : "Order activity"}
            values={data.last7 || []}
            dayLabels={last7Labels}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(isAdmin
          ? [
              { label: "Products", value: data.totalProducts, icon: Package, href: "/dashboard/all-products" },
              { label: "Vehicles", value: data.totalVehicles, icon: Car, href: "/dashboard/all-vehicles" },
              { label: "In progress", value: data.completedOrders, icon: CheckCircle, href: "/dashboard/orders" },
              { label: "Paid orders", value: data.paidOrders, icon: TrendingUp, href: "/dashboard/orders" },
            ]
          : [
              { label: "My products", value: data.totalProducts, icon: Package, href: "/dashboard/all-products" },
              { label: "My vehicles", value: data.totalVehicles, icon: Car, href: "/dashboard/all-vehicles" },
              { label: "Paid orders", value: data.paidOrders, icon: TrendingUp, href: "/dashboard/orders" },
              { label: "Pending", value: data.pendingOrders, icon: Clock, href: "/dashboard/orders" },
            ]
        ).map((row) => {
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent orders</h2>
            <Link to="/dashboard/orders" className="text-sm font-medium text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="pb-2 font-semibold">Order</th>
                  <th className="pb-2 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Pay</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.recentOrders || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-slate-500">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-slate-100 text-sm">
                      <td className="py-2 font-mono text-xs text-slate-600">
                        {order.orderNo || `…${String(order._id).slice(-6)}`}
                      </td>
                      <td className="py-2 font-medium tabular-nums">
                        ৳ {Number(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-2">
                        <span
                          className={`badge badge-sm border-0 ${
                            order.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.paymentStatus || "unpaid"}
                        </span>
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
              <span className="font-semibold text-slate-900">{data.totalProducts}</span>
            </li>
            {isAdmin ? (
              <li className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Fleet / vehicles</span>
                <span className="font-semibold text-slate-900">{data.totalVehicles}</span>
              </li>
            ) : (
              <li className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">My vehicles</span>
                <span className="font-semibold text-slate-900">{data.totalVehicles}</span>
              </li>
            )}
            <li className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600">Pending orders</span>
              <span className="font-semibold text-amber-700">{data.pendingOrders}</span>
            </li>
            {isProvider ? (
              <li className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Unsettled earnings</span>
                <span className="font-semibold text-violet-700">
                  ৳ {Number(data.unsettledEarnings || 0).toLocaleString()}
                </span>
              </li>
            ) : null}
            <li className="flex justify-between pt-1">
              <span className="text-slate-600">Payment rate</span>
              <span className="font-semibold text-emerald-600">{paidRate}%</span>
            </li>
          </ul>
          <Link
            to={isProvider ? "/dashboard/provider-finance" : "/dashboard/orders"}
            className="btn btn-block mt-6 gap-2 rounded-xl border-0 bg-slate-900 text-white hover:bg-slate-800"
          >
            {isProvider ? "My finance" : "View orders"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
