/** Shared auth error handling for axios instances. */
let sessionRevokedHandler = null;

export const SESSION_REVOKED_CODE = "SESSION_REVOKED";

export function registerSessionRevokedHandler(handler) {
  sessionRevokedHandler = typeof handler === "function" ? handler : null;
}

export function isSessionRevokedResponse(error) {
  return (
    error?.response?.status === 401 &&
    error?.response?.data?.code === SESSION_REVOKED_CODE
  );
}

export function notifySessionRevoked(error) {
  if (!isSessionRevokedResponse(error)) return false;
  sessionRevokedHandler?.(error?.response?.data?.message);
  return true;
}

export function attachAuthResponseInterceptor(axiosInstance) {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      notifySessionRevoked(error);
      return Promise.reject(error);
    }
  );
}
