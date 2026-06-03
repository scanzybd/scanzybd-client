/** Label + value row for order/payment summary cards */
export default function InfoRow({ label, value, mono = false, className = "" }) {
  if (value == null || value === "" || value === "—") return null;

  return (
    <div
      className={`flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-700/80 ${className}`}
    >
      <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span
        className={`min-w-0 text-right text-sm font-medium text-slate-900 dark:text-slate-100 ${
          mono ? "font-mono text-xs leading-snug break-all" : ""
        }`}
        title={mono && typeof value === "string" ? value : undefined}
      >
        {value}
      </span>
    </div>
  );
}
