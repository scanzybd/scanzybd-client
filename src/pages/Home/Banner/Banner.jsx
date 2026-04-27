import React from 'react';
import { Link } from 'react-router-dom';
import bannerImage from '../../../assets/banner/Banner.png';
import { ArrowRight, QrCode } from 'lucide-react';
import { useTranslation } from "react-i18next";

const Banner = () => {
    const { t } = useTranslation();
    const featureItems = t("home.features.items", { returnObjects: true });

    return (
        <div className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-linear-to-b from-slate-900 to-slate-800">
            {/* Background Image with Overlay */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <img
                    src={bannerImage}
                    alt="Banner"
                    className="h-full w-full object-cover object-[center_30%] sm:object-center"
                />
                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-slate-900/85 via-slate-900/75 to-yellow-900/85 sm:from-slate-900/80 sm:via-slate-900/70 sm:to-yellow-900/80"></div>
            </div>

            {/* Content Container — flex-1 so vertical center works with min-height parents */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-10 pt-20 sm:px-6 sm:py-20 md:py-24 lg:px-8">
                <div className="mx-auto w-full max-w-4xl space-y-5 text-center sm:space-y-8">
                    {/* Badge */}
                    {/* <div className="inline-flex max-w-[95vw] items-center justify-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-500/20 px-3 py-2 backdrop-blur-sm sm:px-4">
                        <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-400"></div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-yellow-200 sm:text-sm">
                            {t("home.hero.badge")}
                        </span>
                    </div> */}

                    {/* Main Heading */}
                    <h1 className="text-balance text-[clamp(1.75rem,6vw+0.5rem,4.5rem)] font-bold leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                        {t("home.hero.heading")}
                    </h1>

                    {/* Subtitle */}
                    <p className="mx-auto max-w-2xl text-pretty text-sm leading-relaxed text-gray-300 sm:text-lg md:text-xl">
                        {t("home.hero.subheading")}
                    </p>

                    {/* Features List */}
                    <div className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-3 sm:gap-4 sm:py-6">
                        {featureItems?.slice(0, 3).map((item) => (
                            <div key={item} className="flex items-center justify-center gap-2 text-sm text-gray-300 sm:text-base">
                                <QrCode className="w-5 h-5 text-yellow-400" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 sm:pt-8">
                        <Link
                            to="/product"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 sm:py-4 bg-linear-to-r from-yellow-400 to-amber-400 text-gray-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-amber-500 transition transform hover:scale-105 shadow-lg"
                        >
                            {t("home.hero.primaryCta")}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/about"
                            className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition text-center"
                        >
                            {t("home.hero.secondaryCta")}
                        </Link>
                    </div>

                    {/* Trust Indicator */}
                    {/* <div className="pt-6 sm:pt-8 text-xs sm:text-sm text-gray-400">
                        {t("home.hero.trust")}
                    </div> */}
                </div>
            </div>

            {/* Decorative Elements — smaller on narrow screens so they don’t crowd content */}
            <div className="pointer-events-none absolute left-4 top-16 h-16 w-16 rounded-full bg-blue-500/10 blur-3xl sm:left-10 sm:top-10 sm:h-20 sm:w-20"></div>
            <div className="pointer-events-none absolute bottom-8 right-4 h-24 w-24 rounded-full bg-purple-500/10 blur-3xl sm:bottom-10 sm:right-10 sm:h-32 sm:w-32"></div>
            <div className="pointer-events-none absolute left-1/4 top-1/2 hidden h-32 w-32 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl sm:left-1/3 sm:block sm:h-40 sm:w-40"></div>
        </div>
    );
};

export default Banner;