import React from 'react';
import { Outlet } from 'react-router';
import ScrollToTop from "../components/ScrollToTop";
import RouteSeo from "../components/SEO/RouteSeo";

const AuthLayout = () => {
    return (
        <div className="relative min-h-screen">
            <RouteSeo />
            <ScrollToTop />
            <Outlet />
        </div>
    );
};

export default AuthLayout;
