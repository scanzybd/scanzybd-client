import React from 'react';
import { Outlet } from 'react-router';
import ScrollToTop from "../components/ScrollToTop";
import LanguageSwitcher from "../components/LanguageSwitcher";


const AuthLayout = () => {
    return (
        <div className="relative min-h-screen">
            <ScrollToTop />
            <div className="absolute right-3 top-3 z-50 sm:right-4 sm:top-4">
                <LanguageSwitcher />
            </div>
            <Outlet />
        </div>

    );
};

export default AuthLayout;
