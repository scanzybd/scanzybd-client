
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './AuthContext';
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import axios from 'axios';
import { setAppJwt, clearAppJwt, getAppJwtIfValid } from '../../utils/appJwtStorage';
import { QUERY_CACHE_STORAGE_KEY } from '../../lib/queryPersister';
import { API_BASE_URL } from '../../config/api';
import { auth } from '../../firebase/firebase.init';
import useCart from '../../hooks/useCart';

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

    const logOut = async () => {
        setLoading(true);
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
        setLoading(false);
    };

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
        } catch {
            setUser(null);
            setUserRole(null);
            clearAppJwt();
            resetCartView();
        }
    };

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
