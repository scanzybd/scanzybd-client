import React from 'react';
import { Link, Outlet } from 'react-router';
import ProFastLogo from '../pages/Home/Shared/Logo/ProFastLogo';

const AuthLayout = () => {
    return (
        <div>
            {/* Logo */}
            <div >
                <Link to="/">
                    <ProFastLogo />
                </Link>
            </div>

            {/* Grid layout */}
            <div >

                {/* LEFT SIDE */}
                <div className="flex">
                    <Outlet />
                </div>

              
            </div>
        </div>

    );
};

export default AuthLayout;
