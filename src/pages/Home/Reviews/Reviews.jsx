import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, Heart } from "lucide-react";
import { BRAND_FULL } from "../../../config/company";
import { API_BASE_URL } from "../../../config/api";
import { Link } from "react-router-dom";

const iconByStatLabel = {
  "active tags": Users,
  "revenue growth": TrendingUp,
  "customer satisfaction": Heart,
};

const statIconFallback = [Users, TrendingUp, Heart];

const Reviews = () => {
  const { data } = useQuery({
    queryKey: ["public-reviews"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/reviews`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
  });

  const stats = Array.isArray(data?.stats) ? data.stats : [];
  const testimonials = Array.isArray(data?.testimonials) ? data.testimonials : [];

  return (
    <div className="w-full bg-linear-to-b from-slate-50 via-white to-slate-50">
      {/* HERO SECTION */}
      <section className="bg-linear-to-r from-yellow-400 to-amber-500 py-16 px-4">
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
              <span className="bg-linear-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                for Privacy
              </span>
            </h2>

            <p className="text-slate-600 mb-6">
              We are a customer-centric team dedicated to providing secure,
              innovative solutions for vehicle owners, students, and businesses.
            </p>

            <div className="flex gap-4">
  <Link
    to="/product"
    className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition font-semibold inline-block"
  >
    Get Started
  </Link>

  <Link
    to="/about"
    className="px-6 py-3 border border-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-50 transition font-semibold inline-block"
  >
    Learn More
  </Link>
</div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat, idx) => {
              const key = String(stat.label || "").toLowerCase();
              const Icon =
                iconByStatLabel[key] || statIconFallback[idx % statIconFallback.length];
              return (
                <div
                  key={stat._id || idx}
                  className="bg-white shadow-lg rounded-2xl p-6 text-center"
                >
                  <div
                    className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center bg-linear-to-r from-amber-600 to-yellow-500"
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
              key={t._id}
              className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition"
            >
              <div className="text-yellow-400 mb-2">{"★".repeat(Math.max(1, Math.min(5, Number(t.stars) || 5)))}</div>
              <p className="text-sm text-slate-600 mb-4">"{t.text}"</p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{t.avatar || "👤"}</span>
                <span>{t.author}</span>
              </div>
              {t.source ? <p className="mt-1 text-xs text-slate-500">{t.source}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;