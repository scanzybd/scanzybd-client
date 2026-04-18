import React from 'react';
import { Link, Outlet } from 'react-router';
import ProFastLogo from '../pages/Home/Shared/Logo/ProFastLogo';
import ScrollToTop from "../components/ScrollToTop";


const AuthLayout = () => {
    return (
        <div>
            <ScrollToTop />
           <Outlet />
        </div>

    );
};

export default AuthLayout;
