/** Shared auth error handling for axios instances. */
let authRevokedHandler = null;

export const SESSION_REVOKED_CODE = "SESSION_REVOKED";
export const TOKEN_REVOKED_CODE = "TOKEN_REVOKED";

export function registerAuthRevokedHandler(handler) {
  authRevokedHandler = typeof handler === "function" ? handler : null;
}

/** @deprecated Use registerAuthRevokedHandler */
export function registerSessionRevokedHandler(handler) {
  registerAuthRevokedHandler(handler);
}

export function isAuthRevokedResponse(error) {
  const code = error?.response?.data?.code;
  return (
    error?.response?.status === 401 &&
    (code === SESSION_REVOKED_CODE || code === TOKEN_REVOKED_CODE)
  );
}

/** @deprecated Use isAuthRevokedResponse */
export function isSessionRevokedResponse(error) {
  return isAuthRevokedResponse(error);
}

export function notifyAuthRevoked(error) {
  if (!isAuthRevokedResponse(error)) return false;
  authRevokedHandler?.(
    error?.response?.data?.message,
    error?.response?.data?.code
  );
  return true;
}

/** @deprecated Use notifyAuthRevoked */
export function notifySessionRevoked(error) {
  return notifyAuthRevoked(error);
}

export function attachAuthResponseInterceptor(axiosInstance) {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      notifyAuthRevoked(error);
      return Promise.reject(error);
    }
  );
}
