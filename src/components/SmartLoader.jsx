import React from "react";

const SmartLoader = ({
  label = "Loading data...",
  fullPage = false,
  className = "",
}) => {
  return (
    <div
      className={`${fullPage ? "min-h-[55vh]" : "min-h-[180px]"} flex items-center justify-center ${className}`}
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="loading loading-spinner loading-md text-amber-500" />
          <p className="text-sm font-semibold text-slate-700">{label}</p>
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-2 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-2 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="h-2 w-2/3 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

export default SmartLoader;
