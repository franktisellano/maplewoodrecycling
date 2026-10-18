import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import art from '../art/paint';

function Navbar() {
    return (
        <header className="site-header">
            <Link className="wordmark" to="/">
                <span dangerouslySetInnerHTML={{ __html: art.mark }} />
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
