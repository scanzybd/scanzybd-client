
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './AuthContext';
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import axios from 'axios';
import { setAppJwt, clearAppJwt, getAppJwtIfValid } from '../../utils/appJwtStorage';
import { QUERY_CACHE_STORAGE_KEY } from '../../lib/queryPersister';
import { API_BASE_URL } from '../../config/api';
import { auth } from '../../firebase/firebase.init';

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const registerUser = (name, email, password) => {
        setLoading(true);
        return axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password });
    };

    const signInUser = async (email, password) => {
        setLoading(true);
        const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
        if (res.data?.token && res.data?.expiresAt != null) {
            setAppJwt(res.data.token, res.data.expiresAt);
        }
        setUser(res.data?.user ?? null);
        setUserRole(res.data?.user?.role ?? null);
        setLoading(false);
        return res;
    };

    const signInGoogle = async () => {
        setLoading(true);
        const result = await signInWithPopup(auth, googleProvider);
        const socialUser = result.user;
        const res = await axios.post(`${API_BASE_URL}/api/auth/social`, {
            email: socialUser.email,
            name: socialUser.displayName || "Social User",
            photo: socialUser.photoURL || null,
            provider: "google",
            providerId: socialUser.uid,
        });
        if (res.data?.token && res.data?.expiresAt != null) {
            setAppJwt(res.data.token, res.data.expiresAt);
        }
        setUser(res.data?.user ?? null);
        setUserRole(res.data?.user?.role ?? null);
        setLoading(false);
        return res;
    };

    const logOut = async () => {
        setLoading(true);
        clearAppJwt();
        setUser(null);
        setUserRole(null);
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

    const updateUserProfile = (profile) => {
        setUser((prev) => (prev ? { ...prev, ...profile } : prev));
        return Promise.resolve();
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
            const role =
                raw != null && String(raw).trim() !== ""
                    ? String(raw).trim()
                    : null;
            setUser(response.data ?? null);
            setUserRole(role);
        } catch {
            setUser(null);
            setUserRole(null);
            clearAppJwt();
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
