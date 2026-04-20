import { useEffect } from "react";
import { allRouteChunkLoaders } from "./routeChunks";

/**
 * After first paint, loads all route JS chunks in the background (idle / short delay).
 * Then React.lazy() resolves immediately on navigation — no full-page spinner each time.
 */
export default function RoutePrefetch() {
  useEffect(() => {
    const prefetch = () => {
      if (typeof navigator !== "undefined" && navigator.connection?.saveData) {
        return;
      }
      for (const loader of allRouteChunkLoaders) {
        void loader().catch(() => {});
      }
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }

    const t = setTimeout(prefetch, 600);
    return () => clearTimeout(t);
  }, []);

  return null;
}
