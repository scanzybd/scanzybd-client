import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useTranslation } from "react-i18next";
import {
  shellPage,
  cardSurface,
  fieldInput,
  btnPrimary,
  textHeading,
  textMuted,
} from "../../../lib/uiClasses";

const ContactPage = () => {
  const { t } = useTranslation();
  const axiosSecure = useAxiosSecure();

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosSecure.post("/api/contact", form);

      alert(res.data.message || t("contactPage.success"));

      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.log(error);
      alert(t("contactPage.error"));
    }
  };

  const iconClass =
    "h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400";

  return (
    <div className={`min-h-screen ${shellPage}`}>
      {/* Hero */}
      <div className="border-b border-slate-200 bg-linear-to-br from-slate-100 via-white to-slate-50 py-14 text-center dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <h1 className={`text-3xl font-bold tracking-tight sm:text-4xl ${textHeading}`}>
          {t("contactPage.heading")}
        </h1>
        <p className={`mt-2 text-lg ${textMuted}`}>
          {t("contactPage.subheading")}
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:gap-12">
        {/* Info */}
        <div className="space-y-6">
          <h2 className={`text-2xl font-bold ${textHeading}`}>{t("contactPage.leadTitle")}</h2>

          <p className={textMuted}>
            {t("contactPage.leadText")}
          </p>

          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Mail className={iconClass} aria-hidden />
              <span className={textHeading}>{t("contactPage.email")}</span>
            </li>
            
            <li className="flex items-start gap-3">
              <MapPin className={iconClass} aria-hidden />
              <span className={textHeading}>
                {t("contactPage.address1")}, {t("contactPage.address2")}
              </span>
            </li>
            <li className={`text-sm ${textMuted}`}>{t("contactPage.hours")}</li>
          </ul>
        </div>

        {/* Form */}
        <div className={`p-6 sm:p-8 ${cardSurface}`}>
          <h2 className={`mb-6 text-xl font-bold ${textHeading}`}>
            {t("contactPage.formTitle")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className={`mb-1.5 block text-sm font-medium ${textMuted}`}>
                {t("contactPage.name")}
              </span>
              <input
                type="text"
                name="name"
                placeholder={t("contactPage.namePlaceholder")}
                value={form.name}
                onChange={handleChange}
                className={fieldInput}
                required
                autoComplete="name"
              />
            </label>

            <label className="block">
              <span className={`mb-1.5 block text-sm font-medium ${textMuted}`}>
                {t("contactPage.emailLabel")}
              </span>
              <input
                type="email"
                name="email"
                placeholder={t("contactPage.emailPlaceholder")}
                value={form.email}
                onChange={handleChange}
                className={fieldInput}
                required
                autoComplete="email"
              />
            </label>

            <label className="block">
              <span className={`mb-1.5 block text-sm font-medium ${textMuted}`}>
                {t("contactPage.message")}
              </span>
              <textarea
                name="message"
                placeholder={t("contactPage.messagePlaceholder")}
                value={form.message}
                onChange={handleChange}
                rows={5}
                className={`${fieldInput} min-h-[120px] resize-y`}
                required
              />
            </label>

            <button type="submit" className={`${btnPrimary} gap-2`}>
              <Send className="h-4 w-4 shrink-0" aria-hidden />
              {t("contactPage.send")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
