
import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase/firebase.init';
import axios from 'axios';

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
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
        return signOut(auth);
    }

    const updateUserProfile = (profile) => {
        return updateProfile(auth.currentUser, profile)
    }

    // Fetch user role from backend
    const fetchUserRole = async (firebaseUser) => {
        try {
            const token = await firebaseUser.getIdToken();
            const response = await axios.get('http://localhost:5000/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUserRole(response.data.role);
        } catch (error) {
            console.error('Failed to fetch user role:', error);
            setUserRole('user'); // Default to user role
        }
    };

    // observe user state
    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await fetchUserRole(currentUser);
            } else {
                setUserRole(null);
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
