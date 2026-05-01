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
    <div className="w-full bg-linear-to-b from-slate-50 via-white to-slate-50 
    dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* HERO */}
      <section className="bg-linear-to-r from-yellow-400 to-amber-500 px-4 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-4xl lg:text-5xl dark:text-gray-900">
            Trusted by Thousands
          </h1>
          <p className="text-base text-gray-800 sm:text-lg dark:text-gray-900">
            See what our customers say about {BRAND_FULL}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">

        {/* MISSION + STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">

          {/* TEXT */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl lg:text-4xl">
              We Make Tech{" "}
              <span className="bg-linear-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                for Privacy
              </span>
            </h2>

            <p className="mb-6 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              We are a customer-centric team dedicated to providing secure,
              innovative solutions for vehicle owners, students, and businesses.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/product"
                className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition font-semibold"
              >
                Get Started
              </Link>

              <Link
                to="/about"
                className="px-6 py-3 border border-yellow-400 text-gray-900 
                dark:text-slate-200 
                rounded-lg 
                hover:bg-yellow-50 dark:hover:bg-slate-800 
                dark:border-yellow-500 
                transition font-semibold"
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
                  className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center bg-linear-to-r from-amber-600 to-yellow-500">
                    <Icon className="text-white w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold sm:text-2xl text-slate-900 dark:text-white">
                    {stat.value}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
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
              className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 hover:shadow-lg transition"
            >
              <div className="mb-2 text-yellow-400">
                {"★".repeat(Math.max(1, Math.min(5, Number(t.stars) || 5)))}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                "{t.text}"
              </p>

              <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                <span>{t.avatar || "👤"}</span>
                <span>{t.author}</span>
              </div>

              {t.source && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t.source}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;