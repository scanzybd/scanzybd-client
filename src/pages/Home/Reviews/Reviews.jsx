import React from "react";
import { Users, TrendingUp, Heart } from "lucide-react";
import { BRAND_FULL } from "../../../config/company";

const Reviews = () => {
  const stats = [
    {
      icon: Users,
      value: "950,000+",
      label: "Active Tags",
      color: "from-yellow-500 to-yellow-400",
    },
    {
      icon: TrendingUp,
      value: "4x",
      label: "Revenue Growth",
      color: "from-amber-600 to-amber-400",
    },
    {
      icon: Heart,
      value: "98.7%",
      label: "Customer Satisfaction",
      color: "from-orange-600 to-orange-400",
    },
  ];

  const testimonials = [
    {
      id: 1,
      text: "Good idea and execution. This product has completely changed how we manage vehicle information.",
      author: "Rajesh Kumar",
      source: "Google Review",
      avatar: "👨‍💼",
    },
    {
      id: 2,
      text: "A must have for all vehicles. Highly recommended!",
      author: "Priya Singh",
      source: "Amazon Customer",
      avatar: "👩‍💼",
    },
    {
      id: 3,
      text: "I love it! Now I don’t have to leave my number with strangers.",
      author: "Amit Patel",
      source: "Amazon Customer",
      avatar: "👨‍🔧",
    },
    {
      id: 4,
      text: "Excellent service and support. Very responsive team.",
      author: "Neha Sharma",
      source: "Google Review",
      avatar: "👩‍🎓",
    },
  ];

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-yellow-400 to-amber-500 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h1>
          <p className="text-gray-800 text-lg">
            See what our customers say about {BRAND_FULL}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* MISSION + STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* LEFT TEXT */}
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              We Make Tech{" "}
              <span className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                for Privacy
              </span>
            </h2>

            <p className="text-slate-600 mb-6">
              We are a customer-centric team dedicated to providing secure,
              innovative solutions for vehicle owners, students, and businesses.
            </p>

            <div className="flex gap-4">
              <button className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition font-semibold">
                Get Started
              </button>
              <button className="px-6 py-3 border border-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-50 transition font-semibold">
                Learn More
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white shadow-lg rounded-2xl p-6 text-center"
                >
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center bg-gradient-to-r ${stat.color}`}
                  >
                    <Icon className="text-white w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition"
            >
              <div className="text-yellow-400 mb-2">★★★★★</div>
              <p className="text-sm text-slate-600 mb-4">"{t.text}"</p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{t.avatar}</span>
                <span>{t.source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;