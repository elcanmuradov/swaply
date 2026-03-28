import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ShieldAlert, LogOut, ShieldCheck, Users } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className="admin-sidebar glass">
            <div className="admin-logo">
                <ShieldCheck size={32} color="var(--accent)" />
                <span>Admin Panel</span>
            </div>
            <nav className="admin-nav">
                <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <ShoppingBag size={20} />
                    <span>Products</span>
                </NavLink>
                <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <Users size={20} />
                    <span>Users</span>
                </NavLink>
                <NavLink to="/admin/messages" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <ShieldAlert size={20} />
                    <span>Reported Messages</span>
                </NavLink>
            </nav>
            <div className="admin-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
