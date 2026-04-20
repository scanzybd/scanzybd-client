import { useIsFetching } from "@tanstack/react-query";

/**
 * Thin bar while any React Query request runs — so “data loading” is visible.
 */
export default function GlobalFetchingBar() {
  const fetching = useIsFetching({ fetchStatus: "fetching" });
  if (fetching === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden bg-yellow-100"
      role="progressbar"
      aria-busy="true"
      aria-valuetext="Loading data"
    >
      <div className="h-full w-full animate-pulse bg-yellow-500" />
    </div>
  );
}
