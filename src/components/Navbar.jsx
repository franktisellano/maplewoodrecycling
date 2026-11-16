import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { paintingUrl } from '../art/urls';

function Navbar() {
    return (
        <header className="site-header">
            <Link className="wordmark" to="/">
                <img src={paintingUrl('mark')} alt="" width="32" height="32" />
                Maplewood Recycling
            </Link>
            <nav className="site-nav" aria-label="Main">
                <NavLink to="/" end>Schedule</NavLink>
                <NavLink to="/guidelines">Guidelines</NavLink>
                <NavLink to="/reminders">Reminders</NavLink>
            </nav>
        </header>
    );
}

export default Navbar;
