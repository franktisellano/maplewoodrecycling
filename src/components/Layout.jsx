import React, { useLayoutEffect } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Opening a page by link starts it at the top, as a normal page load would. Back and forward
// (POP) are left alone so the browser returns you to where you were.
function useScrollToTopOnNavigate() {
    const { pathname } = useLocation();
    const navigationType = useNavigationType();
    useLayoutEffect(() => {
        if (navigationType !== 'POP') window.scrollTo(0, 0);
    }, [pathname, navigationType]);
}

function Layout() {
    useScrollToTopOnNavigate();
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
