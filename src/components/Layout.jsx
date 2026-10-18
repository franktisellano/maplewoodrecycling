import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
    return (
        <>
            <a className="skip" href="#main">Skip to content</a>
            <Navbar />
            <main id="main">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}

export default Layout;
