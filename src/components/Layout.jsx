import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
    const location = useLocation();

    // Dynamic Header Title based on route
    const getHeaderTitle = () => {
        switch (location.pathname) {
            case '/':
                return 'Maplewood Recycling Schedule';
            case '/guidelines':
                return 'Recycling Guidelines';
            case '/reminders':
            default:
                return 'Calendar Reminders';
        }
    };

    const getHeaderSubtitle = () => {
        switch (location.pathname) {
            case '/':
                return 'View the complete pickup schedule for your zone.';
            case '/guidelines':
                return 'What goes in the bin? Follow these rules to keep our recycling stream clean.';
            case '/reminders':
            default:
                return 'Get the 2026 schedule for your zone imported directly to your Google Calendar.';
        }
    };

    return (
        <div className="container">
            <header>
                <Navbar />
                <h1>{getHeaderTitle()}</h1>
                <p className="subtitle">{getHeaderSubtitle()}</p>
            </header>

            <div className="content">
                <Outlet />
            </div>

            <Footer />
        </div>
    );
}

export default Layout;
