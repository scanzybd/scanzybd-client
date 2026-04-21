/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";

/** Only if navigation happens before prefetch — slim top bar, layout stays visible */
export const RouteFallback = () => (
  <div
    className="pointer-events-none fixed inset-x-0 top-0 z-100 h-0.5 bg-yellow-100"
    aria-hidden
  >
    <div className="h-full w-full origin-left animate-pulse bg-yellow-500/90" />
  </div>
);

/** Default export page — wraps in Suspense */
export function lazyPage(importFn) {
  const Lazy = lazy(importFn);
  function Page() {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Lazy />
      </Suspense>
    );
  }
  return Page;
}

/** Use when a route needs `<AdminRoute>` / `<PrivateRoute>` around the lazy chunk */
export function lazyImport(importFn) {
  return lazy(importFn);
}
