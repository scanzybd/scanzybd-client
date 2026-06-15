import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, Zap, TrendingUp, Crown, ArrowRight, Package } from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import SmartLoader from "../../../components/SmartLoader";

const CATEGORY_ICONS = {
  starter: TrendingUp,
  standard: Zap,
  premium: Crown,
};

const CATEGORY_LABELS = {
  starter: "Starter package",
  standard: "Standard package",
  premium: "Premium package",
};

function normalizePackages(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  return [];
}

function formatPrice(amount, currency = "BDT") {
  const value = Number(amount || 0).toLocaleString();
  if (String(currency).toUpperCase() === "BDT") return `৳ ${value}`;
  return `${currency} ${value}`;
}

const OfferShowcase = () => {
  const axios = useAxios();

  const { data: packages = [], isLoading, isError } = useQuery({
    queryKey: ["homePackages"],
    queryFn: async () => {
      const response = await axios.get("/api/package");
      return normalizePackages(response.data);
    },
  });

  const plans = useMemo(
    () =>
      packages.map((item, index) => {
        const category = String(item.category || "starter").toLowerCase();
        return {
          id: item._id || `pkg-${index}`,
          title: item.title,
          subtitle: CATEGORY_LABELS[category] || "Business package",
          price: item.price,
          currency: item.currency || "BDT",
          description: item.description,
          icon: CATEGORY_ICONS[category] || [TrendingUp, Zap, Crown][index % 3],
          features: Array.isArray(item.features) ? item.features : [],
          highlight: Boolean(item.highlight),
          badge: item.highlight ? "Popular" : "",
        };
      }),
    [packages]
  );

  if (isLoading) {
    return <SmartLoader fullPage label="Loading packages..." />;
  }

  if (isError) {
    return (
      <div className="w-full bg-linear-to-b from-slate-50 via-white to-slate-50 px-4 py-16 text-center">
        <p className="text-slate-600">Could not load packages. Please try again later.</p>
      </div>
    );
  }

  if (!plans.length) {
    return null;
  }

  return (
    <div className="w-full bg-linear-to-b from-slate-50 via-white to-slate-50">
      <div className="bg-linear-to-r from-yellow-400 to-amber-500 px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-4xl md:text-5xl">
            Flexible Plans for Every Business
          </h2>
          <p className="text-base text-gray-800 sm:text-lg md:text-xl">
            Choose the perfect plan to transform your business with our QR-based smart solutions
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon;

            return (
              <div
                key={plan.id}
                className={`relative overflow-hidden rounded-2xl bg-white transition hover:scale-105 ${
                  plan.highlight
                    ? "border-2 border-yellow-500 shadow-2xl md:scale-105"
                    : "border border-slate-200 shadow-lg hover:shadow-xl"
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-0 rounded-bl-lg bg-linear-to-r from-yellow-400 to-amber-500 px-4 py-2 text-xs font-bold text-gray-900">
                    {plan.badge}
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div
                      className={`rounded-lg p-3 ${
                        plan.highlight
                          ? "bg-linear-to-r from-yellow-400 to-amber-500"
                          : "bg-slate-100"
                      }`}
                    >
                      <IconComponent
                        className={`h-6 w-6 ${
                          plan.highlight ? "text-white" : "text-yellow-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
                        {plan.title}
                      </h3>
                      <p className="text-sm text-slate-600">{plan.subtitle}</p>
                    </div>
                  </div>

                  <p className="mb-6 text-sm text-slate-600">{plan.description}</p>

                  <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
                        {formatPrice(plan.price, plan.currency)}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/contact"
                    className={`mb-8 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold transition hover:scale-105 ${
                      plan.highlight
                        ? "bg-linear-to-r from-yellow-400 to-amber-500 text-gray-900 hover:from-yellow-500 hover:to-amber-600"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <div className="space-y-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                      What&apos;s Included
                    </p>
                    <ul className="space-y-3">
                      {plan.features.length > 0 ? (
                        plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-sm text-slate-600"
                          >
                            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                            <span>{feature}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-center gap-2 text-sm text-slate-400">
                          <Package className="h-4 w-4" />
                          Features coming soon
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center sm:mt-16 sm:p-8">
          <p className="text-sm text-slate-600 sm:text-base">
            Need a custom plan?
            <Link
              to="/contact"
              className="ml-2 font-semibold text-yellow-600 hover:underline"
            >
              Contact our sales team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfferShowcase;
