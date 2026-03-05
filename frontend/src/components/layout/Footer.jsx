import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-info">
                        <Link to="/" className="logo">Swaply<span>.</span></Link>
                        <p>Ikinci el mehsul satisinin en asan ve tehlukesiz yolu. Al, sat, deyis!</p>
                    </div>
                    <div className="footer-links">
                        <h4>Kateqoriyalar</h4>
                        <ul>
                            <li><Link to="/category/ELEKTRONIKA">Elektronika</Link></li>
                            <li><Link to="/category/GEYIM">Geyim</Link></li>
                            <li><Link to="/category/EV_VE_BAG">Ev ve Bag</Link></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Destek</h4>
                        <ul>
                            <li><Link to="/help">Komek Merkezi</Link></li>
                            <li><Link to="/safety">Tehlukesizlik Qaydalari</Link></li>
                            <li><Link to="/contact">Elaqe</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 Swaply. Butun huquqlar qorunur.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
