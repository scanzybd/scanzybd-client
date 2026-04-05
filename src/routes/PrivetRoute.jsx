import React from 'react';
import useAuth from '../hooks/useAuth';
import { Navigate } from 'react-router';
import { useLocation } from 'react-router';

const PrivetRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation(); // current path


    if (loading) {
        return <span className="loading loading-dots loading-xl"></span>

    }
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }}></Navigate>

    }





    return children;
};

export default PrivetRoute;