import React from 'react';
import Navbar from '../pages/Home/Shared/Navbar/Navbar';
import { Outlet } from 'react-router';
import Footer from '../pages/Home/Shared/Footer/Footer';
import ScrollToTop from "../components/ScrollToTop";


const UserLayout = () => {
    return (
        <div className="min-h-dvh bg-slate-50 transition-colors dark:bg-slate-950">
            <ScrollToTop />
             <Navbar></Navbar>
            <Outlet></Outlet>
            <Footer></Footer>
        </div>
    );
};

export default UserLayout;