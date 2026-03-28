import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Ensure we are at the top
    React.useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Redirect if already logged in as admin
    React.useEffect(() => {
        if (user && (String(user.role).includes('ADMIN'))) {
            window.location.href = '/admin';
        }
    }, [user]);

    const handleChange = (e) => {
        setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/admin/auth/login', credentials);
            const data = response.data.data;
            
            if (data && data.token) {
                const parts = data.token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    const role = payload.role || payload.roles || '';
                    
                    if (String(role).includes('ADMIN')) {
                        login(data.token);
                        window.location.href = '/admin'; // Hard refresh for clean layout
                    } else {
                        setError("Admin access required.");
                    }
                }
            }
        } catch (err) {
            console.error("Login xətası:", err);
            setError("Invalid credentials or access denied.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-wrapper">
            <div className="admin-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="admin-login-card glass"
            >
                <div className="admin-badge">
                    <Shield size={32} />
                </div>
                
                <div className="admin-header">
                    <h1>SWAPLY<span className="dot">.</span>CORE</h1>
                    <p>Internal Administration Gateway</p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="admin-error"
                        >
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label><User size={16} /> Identity</label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="admin@swaply.com"
                            value={credentials.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label><Lock size={16} /> Access Code</label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="admin-btn">
                        {loading ? (
                            <Loader2 className="spinner" size={20} />
                        ) : (
                            <>
                                Initiate Authorization
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="admin-footer-text">
                    This is a secure system. Unauthorized access is prohibited.
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
