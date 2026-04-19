import React from "react";
import { Shield, Smartphone, Zap, Settings, Target, Users, TrendingUp, Award } from "lucide-react";
import { BRAND_FULL, PRODUCT_NAME } from "../../../config/company";

const About = () => {
    const features = [
        {
            icon: Shield,
            title: "Secure Access",
            description: "Only verified users can create and manage QR profiles with bank-level encryption."
        },
        {
            icon: Smartphone,
            title: "Instant Contact",
            description: "Scan QR and directly connect with vehicle owners or service providers."
        },
        {
            icon: Zap,
            title: "Fast System",
            description: "Built with modern stack for lightning-fast and smooth performance."
        },
        {
            icon: Settings,
            title: "Easy Management",
            description: "Users can easily update their profile and services anytime, anywhere."
        },
        {
            icon: Target,
            title: "Smart Tracking",
            description: "Real-time tracking for vehicles, students, and pets with advanced analytics."
        },
        {
            icon: TrendingUp,
            title: "Scalable Platform",
            description: "Enterprise-grade infrastructure designed to handle millions of users."
        }
    ];

    const stats = [
        { number: "10K+", label: "Active Users" },
        { number: "50K+", label: "QR Codes Generated" },
        { number: "99.9%", label: "Uptime" },
        { number: "24/7", label: "Support" }
    ];

    return (
        <div className="w-full bg-gradient-to-b from-slate-50 via-white to-slate-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden pb-20 pt-12 sm:pt-16">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-100/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl"></div>

                <div className="app-container relative max-w-6xl">
                    {/* Hero Content */}
                    <div className="text-center mb-16 sm:mb-20">
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 rounded-full mb-6">
                            <Award className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">
                                About Us
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                            Connecting People Through
                            <span className="block bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                                Smart QR Technology
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            {BRAND_FULL} is a modern, innovative platform designed to revolutionize how vehicle owners, students, and service providers connect and interact securely.
                        </p>
                    </div>

                    {/* Statistics Section */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-20 sm:mb-24">
                        {stats.map((stat, index) => (
                            <div key={index} className="p-6 sm:p-8 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition text-center">
                                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent mb-2">
                                    {stat.number}
                                </div>
                                <p className="text-slate-600 text-sm sm:text-base font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Main Description */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-20 sm:mb-24">
                        <div className="space-y-6">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                                What is {PRODUCT_NAME}?
                            </h2>
                            <div className="space-y-4">
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    {BRAND_FULL} is a modern web-based solution designed to connect vehicle owners and service providers instantly using QR codes. Each user or vehicle gets a unique QR tag that can be scanned to access contact details or service information quickly and securely.
                                </p>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    Our platform eliminates the need to share personal phone numbers directly. Instead, users can scan a QR code and initiate a call or view profile information in a safe and controlled way.
                                </p>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    Built with modern technologies like React, Node.js, Express, MongoDB, and Firebase, we ensure speed, security, and scalability for all our users.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-8 sm:p-12 text-gray-900 shadow-xl flex flex-col justify-center">
                            <h3 className="text-2xl sm:text-3xl font-bold mb-6">Why Choose Us?</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <CheckMark />
                                    <span className="text-base sm:text-lg">Enterprise-grade security and encryption</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckMark />
                                    <span className="text-base sm:text-lg">Lightning-fast QR scanning and processing</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckMark />
                                    <span className="text-base sm:text-lg">Intuitive user interface for all ages</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckMark />
                                    <span className="text-base sm:text-lg">24/7 professional customer support</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckMark />
                                    <span className="text-base sm:text-lg">Continuous innovation and updates</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-slate-900 py-16 sm:py-20 md:py-24">
                <div className="app-container max-w-6xl">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                            Everything you need to manage, track, and connect securely
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="p-6 sm:p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 hover:border-blue-500 transition group hover:shadow-lg"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg p-3 mb-4 group-hover:scale-110 transition">
                                        <IconComponent className="w-full h-full text-white" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

          

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 py-16 sm:py-20 md:py-24">
                <div className="app-container max-w-4xl text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-lg text-gray-800 mb-8 max-w-2xl mx-auto">
                        Join thousands of users who are already using {BRAND_FULL} to connect and manage securely.
                    </p>
                    <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 font-semibold rounded-lg hover:bg-yellow-50 transition transform hover:scale-105 shadow-lg">
                        Start Your Journey Today
                        <TrendingUp className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// CheckMark Component
const CheckMark = () => (
    <div className="flex-shrink-0 mt-1">
        <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
    </div>
);

export default About;