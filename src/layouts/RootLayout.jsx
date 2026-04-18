import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../pages/Home/Shared/Navbar/Navbar';
import Footer from '../pages/Home/Shared/Footer/Footer';
import ScrollToTop from "../components/ScrollToTop";

const RootLayout = () => {
    return (
        <div className='max-w-7xl mx-auto'>
            <ScrollToTop />
            <Navbar></Navbar>
            <Outlet></Outlet>
            <Footer></Footer>
        </div>
    );
};

export default RootLayout;
