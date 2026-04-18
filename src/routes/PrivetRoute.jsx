import React from 'react';
import useAuth from '../hooks/useAuth';
import { Navigate } from 'react-router';
import { useLocation } from 'react-router';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const { user, userRole, loading } = useAuth();
    const location = useLocation(); // current path

    if (loading) {
        return <span className="loading loading-dots loading-xl"></span>
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }}></Navigate>
    }

    // Check role-based access if roles are specified
    if (allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
        return <Navigate to="/" replace></Navigate>
    }

    return children;
};

export default PrivateRoute;