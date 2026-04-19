/** Refresh Firebase ID token if missing or within 1 min of expiry */
const REFRESH_SKEW_MS = 60 * 1000;

/** @param {import("firebase/auth").User | null} user */
export async function getFreshFirebaseIdToken(user) {
    if (!user) return null;
    try {
        const result = await user.getIdTokenResult();
        const expMs = result.expirationTime.getTime();
        const now = Date.now();
        if (!result.token || expMs - now < REFRESH_SKEW_MS) {
            return user.getIdToken(true);
        }
        return user.getIdToken(false);
    } catch {
        return user.getIdToken(true);
    }
}
