import React from 'react';
import Painting from './Painting';

function Footer() {
    return (
        <footer className="site-footer">
            <Painting name="grass" className="footer-grass" />
            <div className="footer-inner">
                <p>
                    Based on the official 2026 Maplewood{' '}
                    <a href="https://www.maplewoodnj.gov/Home/Components/News/News/1250/15" target="_blank" rel="noopener">
                        DPW schedule
                    </a>.
                </p>
                <p className="made">
                    Made by <a href="https://somalabs.dev/">SOMA Labs</a>.
                </p>
                <nav className="footer-links" aria-label="Footer">
                    <a href="https://somalabs.dev/privacy">Privacy</a>
                    <a href="https://somalabs.dev/support">Support</a>
                    <a href="mailto:support@somalabs.dev">support@somalabs.dev</a>
                </nav>
            </div>
        </footer>
    );
}

export default Footer;
