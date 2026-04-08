import React from 'react';
import bannerImage from '../../../assets/banner/Banner.png';
import { ArrowRight, QrCode } from 'lucide-react';

const Banner = () => {
    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <img
                    src={bannerImage}
                    alt="Banner"
                    className="w-full h-full object-cover"
                />
                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/70 to-yellow-900/80"></div>
            </div>

            {/* Content Container */}
            <div className="relative h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
                <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
                    {/* Badge */}
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <span className="text-xs sm:text-sm font-semibold text-yellow-200 uppercase tracking-wider">
                            Smart QR Solution
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                        Scan.
                        <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
                            Connect.
                        </span>
                        <br className="hidden sm:block" />
                        Instantly.
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        QR-based smart system for Vehicle Owner, Student ID & Pet Tag tracking.
                        Revolutionize the way you manage and track what matters most.
                    </p>

                    {/* Features List */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 sm:py-6">
                        <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-gray-300">
                            <QrCode className="w-5 h-5 text-yellow-400" />
                            <span>QR Scanning</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-gray-300">
                            <QrCode className="w-5 h-5 text-yellow-400" />
                            <span>Real-time Tracking</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-gray-300">
                            <QrCode className="w-5 h-5 text-yellow-400" />
                            <span>Secure Management</span>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 sm:pt-8">
                        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 sm:py-4 bg-gradient-to-r from-yellow-400 to-amber-400 text-gray-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-amber-500 transition transform hover:scale-105 shadow-lg">
                            Get Started
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition">
                            Learn More
                        </button>
                    </div>

                    {/* Trust Indicator */}
                    <div className="pt-6 sm:pt-8 text-xs sm:text-sm text-gray-400">
                        Trusted by thousands of users worldwide
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>
    );
};

export default Banner;