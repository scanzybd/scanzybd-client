const KEY_TOKEN = "token";
const KEY_EXPIRES = "tokenExpiresAt";

/**
 * Backend JWT from /api/auth/login or /api/auth/social (24h).
 * @param {string} token
 * @param {number} expiresAtMs epoch milliseconds when JWT expires
 */
export function setAppJwt(token, expiresAtMs) {
    localStorage.setItem(KEY_TOKEN, token);
    localStorage.setItem(KEY_EXPIRES, String(expiresAtMs));
}

export function clearAppJwt() {
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_EXPIRES);
}

/** @returns {number | null} expiry ms or null */
export function getAppJwtExpiresAt() {
    const raw = localStorage.getItem(KEY_EXPIRES);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

/**
 * Valid backend JWT string, or null if missing / expired.
 */
export function getAppJwtIfValid() {
    const token = localStorage.getItem(KEY_TOKEN);
    const exp = getAppJwtExpiresAt();
    if (!token || !exp || Date.now() >= exp) {
        return null;
    }
    return token;
}

export function isAppJwtMissingOrExpired() {
    return getAppJwtIfValid() === null;
}
