import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="main-nav">
            <NavLink
                to="/guidelines"
                className={({ isActive }) => (isActive ? 'active' : '')}
            >
                Guidelines
            </NavLink>
            <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'active' : '')}
            >
                Schedule
            </NavLink>
            <NavLink
                to="/reminders"
                className={({ isActive }) => (isActive ? 'active' : '')}
            >
                Reminders
            </NavLink>
        </nav>
    );
}

export default Navbar;
