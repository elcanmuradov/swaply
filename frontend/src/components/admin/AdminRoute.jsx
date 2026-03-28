import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminRoute = () => {
    const { user, loading, token } = useContext(AuthContext);

    if (loading || (token && !user)) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                backgroundColor: 'var(--bg)'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    // Checking if user exists and has ADMIN role
    const isAdmin = user && (
        String(user.role).includes('ADMIN') || 
        (Array.isArray(user.role) && user.role.some(r => String(r).includes('ADMIN')))
    );

    if (!isAdmin) {
        // Redirtect to main page for non-admin users instead of showing login
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
