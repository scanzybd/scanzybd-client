
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './AuthContext';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase/firebase.init';
import axios from 'axios';
import { setAppJwt, clearAppJwt, getAppJwtExpiresAt } from '../../utils/appJwtStorage';
import { QUERY_CACHE_STORAGE_KEY } from '../../lib/queryPersister';
import { API_BASE_URL } from '../../config/api';

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const registerUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password)
    }

    const signInUser = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password)
    }

    const signInGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    }

    const logOut = () => {
        setLoading(true);
        clearAppJwt();
        queryClient.clear();
        try {
            localStorage.removeItem(QUERY_CACHE_STORAGE_KEY);
        } catch {
            /* ignore */
        }
        return signOut(auth);
    }

    const updateUserProfile = (profile) => {
        return updateProfile(auth.currentUser, profile)
    }

    /** Sync backend JWT (24h) when missing or expired — uses Firebase session */
    const syncBackendJwtIfNeeded = async (firebaseUser) => {
        try {
            const expMs = getAppJwtExpiresAt();
            if (expMs && Date.now() < expMs - 60_000) {
                return;
            }
            const idToken = await firebaseUser.getIdToken(false);
            if (!idToken) return;
            const res = await axios.post(`${API_BASE_URL}/api/auth/firebase`, {
                token: idToken,
            });
            if (res.data?.token && res.data?.expiresAt != null) {
                setAppJwt(res.data.token, res.data.expiresAt);
            }
        } catch (e) {
            console.warn('Backend JWT sync skipped:', e?.message || e);
        }
    };

    /** Load role from MongoDB via /api/auth/me (Firebase token only identifies user). */
    const fetchUserRole = async (firebaseUser) => {
        const load = async (forceRefresh) => {
            const token = await firebaseUser.getIdToken(forceRefresh);
            return axios.get(`${API_BASE_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        };
        try {
            let response;
            try {
                response = await load(false);
            } catch (first) {
                if (first?.response?.status === 401) {
                    await new Promise((r) => setTimeout(r, 400));
                    response = await load(true);
                } else {
                    throw first;
                }
            }
            const raw = response.data?.role;
            const role =
                raw != null && String(raw).trim() !== ""
                    ? String(raw).trim()
                    : null;
            setUserRole(role);
        } catch (error) {
            console.error(
                "Failed to fetch user role:",
                error?.response?.status,
                error?.response?.data || error?.message
            );
            setUserRole(null);
        }
    };

    // observe user state
    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    await Promise.all([
                        fetchUserRole(currentUser),
                        syncBackendJwtIfNeeded(currentUser),
                    ]);
                } catch (e) {
                    console.warn("Auth sync:", e?.message || e);
                }
            } else {
                setUserRole(null);
                clearAppJwt();
            }
            setLoading(false);
        })
        return () => {
            unSubscribe();
        }
    }, [])

    const authInfo = {
        user,
        userRole,
        loading,
        registerUser,
        signInUser,
        signInGoogle,
        logOut,
        updateUserProfile
    }

    return (
        <AuthContext value={authInfo}>
            {children}
        </AuthContext>
    );
};

export default AuthProvider;
