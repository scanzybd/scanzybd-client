import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const QUERY_CACHE_STORAGE_KEY = "qr-tag-react-query";

/**
 * Persists React Query cache in localStorage (not cookies — cookies are ~4KB max
 * and sent on every request). Same tab / refresh = instant stale data, then refetch if stale.
 */
export function createAppPersister() {
  return createSyncStoragePersister({
    storage: window.localStorage,
    key: QUERY_CACHE_STORAGE_KEY,
    throttleTime: 1200,
  });
}
