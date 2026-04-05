import React from "react";

const OfferShowcase = () => {
    const plans = [
        {
            title: "Starter Pack",
            price: "₹2999",
            description: "Perfect for small garages to start digital transformation.",
            features: [
                "20 QR Sampark Tags",
                "Customize with Logo",
                "Marketing Materials",
                "Training Support",
                "Counter Top Box",
                "60 Days Money Back"
            ],
            highlight: false,
        },
        {
            title: "Growth Pack",
            price: "₹6999",
            description: "For growing garages and service centers.",
            features: [
                "50 QR Tags",
                "Staff Management Access",
                "CRM Dashboard",
                "Priority Support",
                "Branding System",
                "Customer Tracking"
            ],
            highlight: true,
        },
        {
            title: "Business Partner Pack",
            price: "₹12999",
            description: "For large garages and multi-branch businesses.",
            features: [
                "100+ QR Tags",
                "White Label Option",
                "Full CRM Access",
                "Dedicated Manager",
                "Advanced Analytics",
                "Multi Staff Control"
            ],
            highlight: false,
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">

            <h1 className="text-3xl font-bold text-center text-blue-600 mb-10">
                Business Growth Offers
            </h1>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className={`rounded-2xl shadow-lg p-6 bg-white border ${
                            plan.highlight ? "border-blue-600 scale-105" : "border-gray-200"
                        } transition`}
                    >

                        {plan.highlight && (
                            <p className="text-sm text-white bg-blue-600 inline-block px-3 py-1 rounded-full mb-3">
                                Most Popular 🔥
                            </p>
                        )}

                        <h2 className="text-2xl font-bold text-gray-800">
                            {plan.title}
                        </h2>

                        <p className="text-gray-500 mt-2">
                            {plan.description}
                        </p>

                        <p className="text-3xl font-bold text-blue-600 mt-4">
                            {plan.price}
                        </p>

                        <ul className="mt-5 space-y-2 text-gray-700 text-sm">
                            {plan.features.map((feature, i) => (
                                <li key={i}>✔ {feature}</li>
                            ))}
                        </ul>

                        <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
                            Apply Now
                        </button>

                    </div>
                ))}

            </div>
        </div>
    );
};

export default OfferShowcase;