import React from 'react';
import useAuth from '../hooks/useAuth';
import { Navigate } from 'react-router';
import { useLocation } from 'react-router';
import SmartLoader from '../components/SmartLoader';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const { user, userRole, loading } = useAuth();
    const location = useLocation(); // current path

    if (loading) {
        return <SmartLoader fullPage label="Checking your account..." />
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