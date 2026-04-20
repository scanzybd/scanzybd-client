import React from 'react';
import { Outlet } from 'react-router';
import ScrollToTop from "../components/ScrollToTop";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ThemeToggle from "../components/ThemeToggle";


const AuthLayout = () => {
    return (
        <div className="relative min-h-screen">
            <ScrollToTop />
            <div className="absolute right-3 top-3 z-50 flex items-center gap-1 sm:right-4 sm:top-4">
                <ThemeToggle />
                <LanguageSwitcher />
            </div>
            <Outlet />
        </div>

    );
};

export default AuthLayout;
