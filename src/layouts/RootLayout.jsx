import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../pages/Home/Shared/Navbar/Navbar';
import Footer from '../pages/Home/Shared/Footer/Footer';

const RootLayout = () => {
    return (
        <div className='max-w-7xl mx-auto'>
            <Navbar></Navbar>
            <Outlet></Outlet>
            <Footer></Footer>
        </div>
    );
};

export default RootLayout;
