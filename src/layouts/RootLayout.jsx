import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../pages/Home/Shared/Navbar/Navbar';
import Footer from '../pages/Home/Shared/Footer/Footer';
import ScrollToTop from "../components/ScrollToTop";

const RootLayout = () => {
    return (
        <div className='min-h-dvh bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100'>
            <ScrollToTop />
            <Navbar></Navbar>
            <main className="min-h-[calc(100dvh-64px)]">
                <Outlet></Outlet>
            </main>
            <Footer></Footer>
        </div>
    );
};

export default RootLayout;
