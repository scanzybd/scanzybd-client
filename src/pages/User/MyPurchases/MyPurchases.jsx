import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Package,
  CalendarClock,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useCart from "../../../hooks/useCart";
import SmartLoader from "../../../components/SmartLoader";

function formatLocalizedDate(iso, lng) {
  if (!iso) return "—";
  try {
    const loc = lng === "bn" ? "bn-BD" : "en-US";
    return new Date(iso).toLocaleString(loc, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

const MyPurchases = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["my-orders", user?.uid],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order/my-orders");
      return res.data;
    },
    enabled: !!user,
  });

  const lines = useMemo(() => {
    const rows = [];
    for (const order of orders) {
      if (order.paymentStatus !== "paid") continue;
      (order.items || []).forEach((item, idx) => {
        rows.push({
          key: `${order._id}-${idx}`,
          order,
          item,
          itemIndex: idx,
        });
      });
    }
    return rows;
  }, [orders]);

  const stats = useMemo(() => {
    let active = 0;
    let expired = 0;
    let legacy = 0;
    const now = new Date();
    for (const { item } of lines) {
      if (!item.validUntil) {
        legacy += 1;
        continue;
      }
      if (new Date(item.validUntil) < now) expired += 1;
      else active += 1;
    }
    return { active, expired, legacy, total: lines.length };
  }, [lines]);

  const handleRenew = (item) => {
    addToCart({
      _id: item.productId,
      productId: item.productId,
      title: item.title,
      name: item.title,
      image: item.image,
      price: item.price,
    });
    navigate("/user/my-cart");
  };

  if (isLoading) {
    return <SmartLoader fullPage label={t("user.myPurchases.loading")} />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-rose-600">
        {t("user.myPurchases.loadError")}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-linear-to-b from-slate-100/80 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-amber-50/40 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20 dark:bg-amber-500 dark:text-slate-950">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  {t("user.myPurchases.title")}
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  {t("user.myPurchases.subtitle")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("user.myPurchases.totalLines")}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/20">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {t("user.myPurchases.active")}
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-300">{stats.active}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm">
            <p className="text-xs font-medium text-rose-800">
              {t("user.myPurchases.expired")}
            </p>
            <p className="mt-1 text-2xl font-bold text-rose-900">{stats.expired}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {t("user.myPurchases.legacy")}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.legacy}</p>
          </div>
        </div>

        {lines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
            <ShoppingBag className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-slate-600 dark:text-slate-300">{t("user.myPurchases.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {lines.map(({ key, order, item }) => {
              const hasWindow = !!item.validUntil;
              const expired =
                hasWindow && new Date(item.validUntil) < new Date();
              const active = hasWindow && !expired;

              return (
                <article
                  key={key}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/90 dark:hover:border-slate-600"
                >
                  <div className="flex gap-4 border-b border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="line-clamp-2 font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {t("user.myPurchases.order")}:{" "}
                        <span className="font-mono">{order._id}</span>
                      </p>
                      <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">
                        {t("user.myPurchases.priceQty", {
                          price: item.price,
                          qty: item.quantity,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {!hasWindow && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                          <Info className="h-3.5 w-3.5" />
                          {t("user.myPurchases.badgeLegacy")}
                        </span>
                      )}
                      {hasWindow && active && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t("user.myPurchases.badgeActive")}
                        </span>
                      )}
                      {hasWindow && expired && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {t("user.myPurchases.badgeExpired")}
                        </span>
                      )}
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
                        {t("user.myPurchases.daysPerUnit", {
                          days: item.validityDays ?? "—",
                        })}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      <p className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                        {t("user.myPurchases.start")}:{" "}
                        {formatLocalizedDate(item.validFrom, i18n.language)}
                      </p>
                      <p className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                        <CalendarClock className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
                        {t("user.myPurchases.end")}:{" "}
                        {hasWindow
                          ? formatLocalizedDate(item.validUntil, i18n.language)
                          : t("user.myPurchases.notTracked")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRenew(item)}
                      className="btn mt-auto gap-2 rounded-xl border-none bg-amber-500 font-semibold text-slate-900 hover:bg-amber-600 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-600"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t("user.myPurchases.renew")}
                    </button>
                    <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
                      {t("user.myPurchases.renewNote")}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPurchases;
