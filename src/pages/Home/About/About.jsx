import React from "react";
import { Link } from "react-router-dom";
import { Award, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const About = () => {
    const { t } = useTranslation();
    const points = t("aboutPage.points", { returnObjects: true });

    return (
        <div className="w-full bg-linear-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="app-container max-w-6xl py-12 sm:py-16">
                <div className="mb-10 text-center">

 {/* Badge */}
                    {/* <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-amber-700">
                        <Award className="h-4 w-4" />
                        <span className="text-sm font-semibold">{t("aboutPage.badge")}</span>
                    </div> */}

                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
                        {t("aboutPage.title")}
                    </h1>
                    <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-300">
                        {t("aboutPage.intro")}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("aboutPage.missionTitle")}</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("aboutPage.mission")}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("aboutPage.visionTitle")}</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("aboutPage.vision")}</p>
                    </div>
                </div>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("aboutPage.storyTitle")}</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">{t("aboutPage.story")}</p>
                </div>

                <div className="mt-8 rounded-2xl bg-linear-to-br from-amber-300 to-amber-400 p-6 text-slate-900 shadow-sm">
                    <h2 className="text-2xl font-bold">{t("aboutPage.whyTitle")}</h2>
                    <p className="mt-2">{t("aboutPage.whyIntro")}</p>
                    <ul className="mt-4 space-y-2">
                        {points.map((point) => (
                            <li key={point} className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-10 text-center">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("aboutPage.ctaTitle")}</h3>
                    <p className="mx-auto mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t("aboutPage.ctaSubtitle")}</p>
                    <Link
                        to="/Products"
                        className="mt-5 inline-flex items-center rounded-xl bg-amber-500 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-600"
                    >
                        {t("aboutPage.ctaButton")}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default About;