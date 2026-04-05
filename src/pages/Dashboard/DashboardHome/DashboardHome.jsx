import { useEffect, useState } from "react";
import {
  GraduationCap,
  Users,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

const DashboardHome = () => {
  const [user, setUser] = useState(null);

  // 👇 TEMP: localStorage user (later API / context use করবে)
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser || { role: "guest", name: "Guest" });
  }, []);

  // ✅ TEMP role access (future e change korte parba)
  const allowedRoles = ["admin", "user", "provider", "guest"];
  const hasAccess = user && allowedRoles.includes(user.role);

  // ❌ access denied UI
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">
          Access Denied
        </h1>
      </div>
    );
  }

  // 📊 dummy stats (future API replace korba)
  const stats = [
    {
      title: "Total Users",
      value: 1200,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Services",
      value: 350,
      icon: GraduationCap,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Growth",
      value: "85%",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Completed",
      value: 780,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard Home
        </h1>
        <p className="text-gray-600">
          Welcome, {user.name} ({user.role})
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">
                    {item.title}
                  </p>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {item.value}
                  </h2>
                </div>

                <div className={`p-3 rounded-xl ${item.bg}`}>
                  <Icon className={item.color} size={28} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default DashboardHome;