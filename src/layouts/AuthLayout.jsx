import React from 'react';
import { Outlet } from 'react-router';
import ScrollToTop from "../components/ScrollToTop";

const AuthLayout = () => {
    return (
        <div className="relative min-h-screen">
            <ScrollToTop />
            <Outlet />
        </div>
    );
};

export default AuthLayout;
