import React from 'react';
import { Search, User, PlusCircle, Heart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link to="/" className="logo">
                    Swaply<span>.</span>
                </Link>

                <div className="search-bar">
                    <input type="text" placeholder="Mehsul, marka ve ya kateqoriya axtar..." />
                    <button className="search-btn">
                        <Search size={20} />
                    </button>
                </div>

                <div className="nav-actions">
                    <Link to="/favorites" className="nav-icon-link">
                        <Heart size={24} />
                        <span className="icon-label">Beyenilenler</span>
                    </Link>
                    <Link to="/messages" className="nav-icon-link">
                        <MessageSquare size={24} />
                        <span className="icon-label">Mesajlar</span>
                    </Link>
                    <Link to="/profile" className="nav-icon-link">
                        <User size={24} />
                        <span className="icon-label">Profil</span>
                    </Link>
                    <Link to="/add-product" className="btn-primary sell-btn">
                        <PlusCircle size={20} />
                        <span>Satis et</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
