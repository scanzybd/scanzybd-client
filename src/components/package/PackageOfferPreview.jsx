import { Check, Zap, TrendingUp, Crown, ArrowRight, Package } from "lucide-react";
import { parseFeatures } from "../../lib/packageFormUtils";

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

function formatPrice(amount, currency = "BDT") {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return "—";
  const value = num.toLocaleString();
  if (String(currency).toUpperCase() === "BDT") return `৳ ${value}`;
  return `${currency} ${value}`;
}

export default function PackageOfferPreview({ form }) {
  const category = String(form?.category || "starter").toLowerCase();
  const IconComponent = CATEGORY_ICONS[category] || TrendingUp;
  const subtitle = CATEGORY_LABELS[category] || "Business package";
  const features = parseFeatures(form?.features || []);
  const highlight = Boolean(form?.highlight);
  const title = String(form?.title || "").trim() || "Package title";
  const description =
    String(form?.description || "").trim() || "Package description will appear here.";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white ${
        highlight
          ? "border-2 border-yellow-500 shadow-xl"
          : "border border-slate-200 shadow-lg"
      }`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 rounded-bl-lg bg-linear-to-r from-yellow-400 to-amber-500 px-4 py-2 text-xs font-bold text-gray-900">
          Popular
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div
            className={`rounded-lg p-3 ${
              highlight
                ? "bg-linear-to-r from-yellow-400 to-amber-500"
                : "bg-slate-100"
            }`}
          >
            <IconComponent
              className={`h-6 w-6 ${highlight ? "text-white" : "text-yellow-600"}`}
            />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
              {title}
            </h3>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </div>
        </div>

        <p className="mb-5 line-clamp-4 text-sm text-slate-600">{description}</p>

        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <span className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {formatPrice(form?.price, "BDT")}
          </span>
        </div>

        <div
          className={`mb-6 flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold ${
            highlight
              ? "bg-linear-to-r from-yellow-400 to-amber-500 text-gray-900"
              : "bg-slate-100 text-slate-900"
          }`}
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-900">
            What&apos;s Included
          </p>
          <ul className="space-y-2">
            {features.length > 0 ? (
              features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))
            ) : (
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Package className="h-4 w-4" />
                Add features to see them here
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
