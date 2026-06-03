import React, { useEffect, useMemo, useState } from "react";
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
  QrCode,
  X,
  CreditCard,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useCart from "../../../hooks/useCart";
import usePaymentGateways from "../../../hooks/usePaymentGateways";
import PaymentGatewayPicker from "../../../components/payment/PaymentGatewayPicker";
import SmartLoader from "../../../components/SmartLoader";
import { formatOrderNo } from "../../../lib/orderDisplayFormat";

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

const RENEW_SAME = "renew_same_qr";
const RENEW_NEW = "renew_new_qr";

const MyPurchases = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { data: gateways } = usePaymentGateways();

  const [renewTag, setRenewTag] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState("bkash");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    if (!gateways) return;
    if (gateways.bkash && !gateways.sslcommerz) setSelectedGateway("bkash");
    else if (!gateways.bkash && gateways.sslcommerz) setSelectedGateway("sslcommerz");
    else setSelectedGateway(gateways.defaultGateway || "bkash");
  }, [gateways]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-purchases", user?._id],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order/my-orders?page=1&limit=100");
      const body = res.data;
      if (Array.isArray(body)) return body;
      return body?.orders ?? [];
    },
    enabled: !!user,
  });

  const { data: tagsData, isLoading: tagsLoading } = useQuery({
    queryKey: ["my-tag-subscriptions", user?._id],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/subscription/my-tags");
      return res.data?.tags ?? [];
    },
    enabled: !!user,
  });

  const orders = Array.isArray(data) ? data : [];
  const tags = Array.isArray(tagsData) ? tagsData : [];

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

  const resolveLineProductId = (item, order, itemIndex) => {
    const fromItem = String(item.productId || item._id || "").trim();
    if (fromItem) return fromItem;
    const tags = order?.tagAssignments || [];
    if (tags[itemIndex]?.productId) return String(tags[itemIndex].productId).trim();
    if (tags[0]?.productId) return String(tags[0].productId).trim();
    return "";
  };

  const handleRenewCart = (item, order, itemIndex) => {
    const productId = resolveLineProductId(item, order, itemIndex);
    if (!productId) {
      setPayError(t("user.myPurchases.missingProductId"));
      return;
    }
    setPayError("");
    addToCart({
      _id: productId,
      productId,
      title: item.title,
      name: item.title,
      image: item.image,
      price: item.price,
    });
    navigate("/user/my-cart");
  };

  const startTagRenew = async (mode) => {
    if (!renewTag?.qrId) return;
    setPaying(true);
    setPayError("");
    try {
      const intentRes = await axiosSecure.post("/api/subscription/renew-intent", {
        qrId: renewTag.qrId,
        mode,
      });
      const order = intentRes.data?.order;
      if (!order?._id) {
        throw new Error(t("user.myPurchases.renewFailed"));
      }
      if (!gateways?.hasOnlinePayment) {
        throw new Error(t("user.myPurchases.noGateway"));
      }
      const payRes = await axiosSecure.post("/api/payment/create", {
        orderId: order._id,
        gateway: selectedGateway,
      });
      const url = payRes.data?.redirectURL || payRes.data?.bkashURL;
      if (url) {
        window.location.assign(url);
        return;
      }
      throw new Error(t("user.myPurchases.renewFailed"));
    } catch (err) {
      setPayError(
        err?.response?.data?.message ||
          err?.message ||
          t("user.myPurchases.renewFailed")
      );
    } finally {
      setPaying(false);
    }
  };

  if (isLoading || tagsLoading) {
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

        {tags.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("user.myPurchases.qrTagsTitle")}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {tags.map((tag) => {
                const hasQr = !!tag.qrId;
                const plate = tag.vehicle?.plate || "—";
                const code = tag.qr?.code || tag.qrCode || "—";
                return (
                  <article
                    key={tag._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {plate}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <QrCode className="h-3.5 w-3.5" />
                          {code}
                        </p>
                      </div>
                      {tag.isExpired ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                          {t("user.myPurchases.badgeExpired")}
                        </span>
                      ) : tag.status === "pending_qr" ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                          {t("user.myPurchases.pendingQr")}
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          {t("user.myPurchases.badgeActive")}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      {t("user.myPurchases.end")}:{" "}
                      {formatLocalizedDate(tag.validUntil, i18n.language)}
                    </p>
                    {hasQr ? (
                      <button
                        type="button"
                        onClick={() => setRenewTag(tag)}
                        className="btn mt-3 w-full gap-2 rounded-xl border-none bg-amber-500 font-semibold text-slate-900 hover:bg-amber-600"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {t("user.myPurchases.renewTag")}
                      </button>
                    ) : (
                      <p className="mt-3 text-xs text-slate-500">
                        {t("user.myPurchases.assignQrFirst")}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("user.myPurchases.totalLines")}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.total}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/20">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {t("user.myPurchases.active")}
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-300">
              {stats.active}
            </p>
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
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.legacy}
            </p>
          </div>
        </div>

        {payError && !renewTag ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {payError}
          </p>
        ) : null}

        {lines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
            <ShoppingBag className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              {t("user.myPurchases.empty")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {lines.map(({ key, order, item, itemIndex }) => {
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
                        <span className="font-mono">
                          {order.orderNo ? formatOrderNo(order.orderNo) : "—"}
                        </span>
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
                      onClick={() => handleRenewCart(item, order, itemIndex)}
                      className="btn mt-auto gap-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t("user.myPurchases.renewCart")}
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

      {renewTag ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t("user.myPurchases.renewModalTitle")}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setRenewTag(null);
                  setPayError("");
                }}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {renewTag.vehicle?.plate} · {renewTag.qr?.code || renewTag.qrCode}
            </p>
            {payError ? (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {payError}
              </p>
            ) : null}
            {gateways ? (
              <PaymentGatewayPicker
                gateways={gateways}
                value={selectedGateway}
                onChange={setSelectedGateway}
                className="mt-4"
              />
            ) : null}
            <div className="mt-5 space-y-3">
              <button
                type="button"
                disabled={paying}
                onClick={() => startTagRenew(RENEW_SAME)}
                className="btn w-full justify-start gap-3 rounded-xl border-none bg-amber-500 font-semibold text-slate-900 hover:bg-amber-600"
              >
                <CreditCard className="h-5 w-5 shrink-0" />
                <span className="text-left">
                  <span className="block">{t("user.myPurchases.renewSameQr")}</span>
                  <span className="block text-xs font-normal opacity-90">
                    {t("user.myPurchases.renewSameQrHint")}
                  </span>
                </span>
              </button>
              <button
                type="button"
                disabled={paying}
                onClick={() => startTagRenew(RENEW_NEW)}
                className="btn w-full justify-start gap-3 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <QrCode className="h-5 w-5 shrink-0" />
                <span className="text-left">
                  <span className="block">{t("user.myPurchases.renewNewQr")}</span>
                  <span className="block text-xs font-normal text-slate-500">
                    {t("user.myPurchases.renewNewQrHint")}
                  </span>
                </span>
              </button>
            </div>
            {paying ? (
              <p className="mt-4 text-center text-sm text-slate-500">
                {t("user.myPurchases.redirectingBkash")}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MyPurchases;
