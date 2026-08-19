
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './AuthContext';
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import axios from 'axios';
import Swal from 'sweetalert2';
import { setAppJwt, clearAppJwt, getAppJwtIfValid } from '../../utils/appJwtStorage';
import { QUERY_CACHE_STORAGE_KEY } from '../../lib/queryPersister';
import { API_BASE_URL } from '../../config/api';
import { auth } from '../../firebase/firebase.init';
import useCart from '../../hooks/useCart';
import {
    notifySessionRevoked,
    registerSessionRevokedHandler,
} from '../../lib/authSessionHandler';

const googleProvider = new GoogleAuthProvider();

/** Match `PrivateRoute` / layout checks — API or legacy DB may send mixed case. */
const normalizeRole = (raw) => {
    if (raw == null || String(raw).trim() === "") return null;
    return String(raw).trim().toLowerCase();
};

const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const { reloadCart, resetCartView } = useCart();
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const loggingOutRef = useRef(false);

    const logOut = useCallback(async (options = {}) => {
        if (loggingOutRef.current) return;
        loggingOutRef.current = true;
        setLoading(true);

        const token = getAppJwtIfValid();
        if (token && !options.remote) {
            try {
                await axios.post(
                    `${API_BASE_URL}/api/auth/logout`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch {
                /* ignore server logout failures */
            }
        }

        clearAppJwt();
        setUser(null);
        setUserRole(null);
        resetCartView();
        queryClient.clear();
        try {
            localStorage.removeItem(QUERY_CACHE_STORAGE_KEY);
        } catch {
            /* ignore */
        }
        try {
            await signOut(auth);
        } catch {
            /* ignore social session signout failures */
        }

        loggingOutRef.current = false;
        setLoading(false);
    }, [queryClient, resetCartView]);

    const registerUser = async (name, email, password) => {
        setLoading(true);
        try {
            return await axios.post(`${API_BASE_URL}/api/auth/register`, {
                name,
                email,
                password,
            });
        } finally {
            setLoading(false);
        }
    };

    const signInUser = async (email, password) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            if (res.data?.token && res.data?.expiresAt != null) {
                setAppJwt(res.data.token, res.data.expiresAt);
            }
            const u = res.data?.user ?? null;
            setUser(u ? { ...u, role: normalizeRole(u.role) } : null);
            setUserRole(normalizeRole(u?.role));
            await reloadCart();
            return res;
        } finally {
            setLoading(false);
        }
    };

    const signInGoogle = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const socialUser = result.user;
            const idToken = await socialUser.getIdToken();
            const res = await axios.post(`${API_BASE_URL}/api/auth/social`, {
                idToken,
                provider: "google",
            });
            if (res.data?.token && res.data?.expiresAt != null) {
                setAppJwt(res.data.token, res.data.expiresAt);
            }
            const u = res.data?.user ?? null;
            setUser(u ? { ...u, role: normalizeRole(u.role) } : null);
            setUserRole(normalizeRole(u?.role));
            await reloadCart();
            return res;
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRole = async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const raw = response.data?.role;
            const role = normalizeRole(raw);
            const payload = response.data ?? null;
            setUser(payload ? { ...payload, role } : null);
            setUserRole(role);
            await reloadCart();
        } catch (err) {
            if (notifySessionRevoked(err)) {
                return;
            }
            setUser(null);
            setUserRole(null);
            clearAppJwt();
            resetCartView();
        }
    };

    useEffect(() => {
        registerSessionRevokedHandler(async (message) => {
            await logOut({ remote: true });
            Swal.fire({
                icon: "info",
                title: "Signed out",
                text:
                    message ||
                    "Your session ended because you signed in on another device or revoked this session.",
            });
        });
        return () => registerSessionRevokedHandler(null);
    }, [logOut]);

    useEffect(() => {
        const role = normalizeRole(userRole);
        if (!user || (role !== "admin" && role !== "provider")) {
            return undefined;
        }

        const checkSession = async () => {
            const token = getAppJwtIfValid();
            if (!token) return;
            try {
                await axios.get(`${API_BASE_URL}/api/auth/session-check`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (err) {
                notifySessionRevoked(err);
            }
        };

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                void checkSession();
            }
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        const timer = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                void checkSession();
            }
        }, 60_000);

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.clearInterval(timer);
        };
    }, [user?._id, userRole, logOut]);

    // Restore session from backend JWT.
    useEffect(() => {
        let cancelled = false;
        const init = async () => {
            await Promise.resolve();
            const token = getAppJwtIfValid();
            if (token) {
                await fetchUserRole(token);
            }
            if (!cancelled) setLoading(false);
        };
        init();
        return () => {
            cancelled = true;
        };
    }, []);

    const updateUserProfile = async (profile) => {
        const token = getAppJwtIfValid();
        if (!token) {
            throw new Error("Not signed in");
        }

        const patch = {};
        if (profile?.name !== undefined) {
            patch.name = String(profile.name).trim();
        }
        if (profile?.displayName !== undefined && patch.name === undefined) {
            patch.name = String(profile.displayName).trim();
        }

        if (!patch.name) {
            throw new Error("Name is required");
        }

        const res = await axios.patch(`${API_BASE_URL}/api/auth/me`, patch, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const updated = res.data ?? null;
        setUser(updated ? { ...updated, role: normalizeRole(updated.role) } : null);
        if (updated?.role) {
            setUserRole(normalizeRole(updated.role));
        }
        return updated;
    };

    const sendUserPasswordResetEmail = async (email) => {
        const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
        return res.data;
    };

    const verifyUserPasswordResetCode = async (email, code) => {
        const res = await axios.post(`${API_BASE_URL}/api/auth/verify-reset-code`, { email, code });
        return res.data;
    };

    const confirmUserPasswordReset = async (email, code, newPassword) => {
        const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
            email,
            code,
            newPassword,
        });
        return res.data;
    };

    const authInfo = {
        user,
        userRole,
        loading,
        registerUser,
        signInUser,
        signInGoogle,
        logOut,
        updateUserProfile,
        sendUserPasswordResetEmail,
        verifyUserPasswordResetCode,
        confirmUserPasswordReset,
    }

    return (
        <AuthContext value={authInfo}>
            {children}
        </AuthContext>
    );
};

export default AuthProvider;
