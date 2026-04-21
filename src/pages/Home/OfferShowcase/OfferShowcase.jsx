import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, X, Zap, TrendingUp, Crown, ArrowRight } from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import SmartLoader from "../../../components/SmartLoader";

const defaultPlans = [
    {
        id: 1,
        title: "Starter Pack",
        subtitle: "Perfect for small businesses",
        monthlyPrice: 299,
        yearlyPrice: 2999,
        description: "Perfect for small garages to start digital transformation.",
        icon: TrendingUp,
        features: [
            { name: "20 QR Sampark Tags", included: true },
            { name: "Customize with Logo", included: true },
            { name: "Marketing Materials", included: true },
            { name: "Training Support", included: true },
            { name: "Counter Top Box", included: true },
            { name: "60 Days Money Back", included: true },
            { name: "Priority Support", included: false },
            { name: "Advanced Analytics", included: false }
        ],
        highlight: false,
        badge: ""
    },
    {
        id: 2,
        title: "Growth Pack",
        subtitle: "For growing businesses",
        monthlyPrice: 699,
        yearlyPrice: 6999,
        description: "For growing garages and service centers.",
        icon: Zap,
        features: [
            { name: "50 QR Tags", included: true },
            { name: "Staff Management Access", included: true },
            { name: "CRM Dashboard", included: true },
            { name: "Priority Support", included: true },
            { name: "Branding System", included: true },
            { name: "Customer Tracking", included: true },
            { name: "White Label Option", included: true },
            { name: "Advanced Analytics", included: true }
        ],
        highlight: true,
        badge: "Most Popular"
    },
    {
        id: 3,
        title: "Business Partner Pack",
        subtitle: "For enterprise solutions",
        monthlyPrice: 1299,
        yearlyPrice: 12999,
        description: "For large garages and multi-branch businesses.",
        icon: Crown,
        features: [
            { name: "100+ QR Tags", included: true },
            { name: "White Label Option", included: true },
            { name: "Full CRM Access", included: true },
            { name: "Dedicated Manager", included: true },
            { name: "Advanced Analytics", included: true },
            { name: "Multi Staff Control", included: true },
            { name: "Custom Integrations", included: true },
            { name: "24/7 Support", included: true }
        ],
        highlight: false,
        badge: "Best Value"
    }
];

const OfferShowcase = () => {
    const [billingCycle, setBillingCycle] = useState("monthly");
    const axios = useAxios();

    const { data: packages = [], isLoading } = useQuery({
        queryKey: ["homePackages"],
        queryFn: async () => {
            const response = await axios.get("/api/package");
            return response.data?.data || [];
        },
    });

    const plans = useMemo(() => {
        if (!packages.length) return defaultPlans;

        return packages.map((item, index) => ({
            id: item._id || index,
            title: item.title,
            subtitle: item.category ? `${item.category.charAt(0).toUpperCase()}${item.category.slice(1)} package` : "Business package",
            monthlyPrice: item.price,
            yearlyPrice: Math.round(item.price * 10),
            description: item.description,
            icon: [TrendingUp, Zap, Crown][index % 3],
            features: item.features?.map((feature) => ({ name: feature, included: true })) || [],
            highlight: item.highlight || false,
            badge: item.highlight ? "Popular" : "",
        }));
    }, [packages]);

    if (isLoading) {
        return <SmartLoader fullPage label="Loading packages..." />;
    }

    return (
        <div className="w-full bg-linear-to-b from-slate-50 via-white to-slate-50">
            {/* Header Section */}
            <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-yellow-400 to-amber-500">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                        Flexible Plans for Every Business
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-800 mb-8">
                        Choose the perfect plan to transform your business with our QR-based smart solutions
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-sm p-1 rounded-full border border-white/30">
                        <button
                            onClick={() => setBillingCycle("monthly")}
                            className={`px-6 py-2 rounded-full font-semibold transition ${
                                billingCycle === "monthly"
                                    ? "bg-white text-yellow-600"
                                    : "text-white hover:text-yellow-100"
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle("yearly")}
                            className={`px-6 py-2 rounded-full font-semibold transition ${
                                billingCycle === "yearly"
                                    ? "bg-white text-yellow-600"
                                    : "text-white hover:text-yellow-100"
                            }`}
                        >
                            Yearly
                            <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
                    {plans.map((plan) => {
                        const IconComponent = plan.icon;
                        const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
                        const billingText = billingCycle === "monthly" ? "/month" : "/year";

                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl overflow-hidden transition transform hover:scale-105 ${
                                    plan.highlight
                                        ? "md:scale-105 border-2 border-yellow-500 shadow-2xl"
                                        : "border border-slate-200 shadow-lg hover:shadow-xl"
                                } bg-white`}
                            >
                                {/* Badge */}
                                {plan.badge && (
                                    <div className="absolute top-0 right-0 bg-linear-to-r from-yellow-400 to-amber-500 text-gray-900 px-4 py-2 text-xs font-bold rounded-bl-lg">
                                        {plan.badge}
                                    </div>
                                )}

                                {/* Plan Content */}
                                <div className="p-6 sm:p-8">
                                    {/* Icon */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`p-3 rounded-lg ${
                                            plan.highlight
                                                ? "bg-linear-to-r from-yellow-400 to-amber-500"
                                                : "bg-slate-100"
                                        }`}>
                                            <IconComponent className={`w-6 h-6 ${
                                                plan.highlight ? "text-white" : "text-yellow-600"
                                            }`} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                                {plan.title}
                                            </h2>
                                            <p className="text-sm text-slate-600">{plan.subtitle}</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-slate-600 mb-6 text-sm">
                                        {plan.description}
                                    </p>

                                    {/* Price */}
                                    <div className="mb-8 p-6 rounded-xl bg-slate-50 border border-slate-200">
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-4xl sm:text-5xl font-bold text-slate-900">
                                                ₹{price.toLocaleString()}
                                            </span>
                                            <span className="text-slate-600 font-medium">{billingText}</span>
                                        </div>
                                        <p className="text-xs text-slate-600">
                                            {billingCycle === "yearly" 
                                                ? `₹${Math.round(price / 12)}/month billed annually` 
                                                : "Billed monthly"}
                                        </p>
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        className={`w-full mb-8 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition transform hover:scale-105 ${
                                            plan.highlight
                                                ? "bg-linear-to-r from-yellow-400 to-amber-500 text-gray-900 hover:from-yellow-500 hover:to-amber-600"
                                                : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                                        }`}
                                    >
                                        Get Started
                                        <ArrowRight className="w-4 h-4" />
                                    </button>

                                    {/* Features List */}
                                    <div className="space-y-4">
                                        <p className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                                            What's Included
                                        </p>
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-3 text-sm text-slate-600"
                                                >
                                                    {feature.included ? (
                                                        <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                    ) : (
                                                        <X className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                                                    )}
                                                    <span className={feature.included ? "" : "text-slate-400 line-through"}>
                                                        {feature.name}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Highlight Border Animation */}
                                {plan.highlight && (
                                    <div className="absolute inset-0 border-2 border-transparent bg-linear-to-r from-yellow-400 to-amber-500 opacity-0 hover:opacity-10 rounded-2xl transition pointer-events-none"></div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Comparison Note */}
                <div className="mt-12 sm:mt-16 p-6 sm:p-8 bg-yellow-50 border border-yellow-200 rounded-2xl text-center">
                    <p className="text-slate-600 text-sm sm:text-base">
                        📞 Need a custom plan? 
                        <span className="font-semibold text-yellow-600 ml-2 cursor-pointer hover:underline">
                            Contact our sales team
                        </span>
                    </p>
                </div>

                {/* FAQ Section */}
                <div className="mt-16 sm:mt-20">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
                        Frequently Asked Questions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                q: "Can I change my plan anytime?",
                                a: "Yes, you can upgrade or downgrade your plan anytime. Changes take effect from the next billing cycle."
                            },
                            {
                                q: "Do you offer refunds?",
                                a: "We offer a 60-day money-back guarantee on all plans. No questions asked!"
                            },
                            {
                                q: "Is there a setup fee?",
                                a: "No, there's no hidden setup fee. You only pay the plan price."
                            },
                            {
                                q: "What payment methods do you accept?",
                                a: "We accept all major credit/debit cards, net banking, and UPI payments."
                            }
                        ].map((faq, idx) => (
                            <div key={idx} className="p-6 bg-white border border-slate-200 rounded-xl">
                                <p className="font-semibold text-slate-900 mb-2">{faq.q}</p>
                                <p className="text-slate-600 text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfferShowcase;
