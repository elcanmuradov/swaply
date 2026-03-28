import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/login', credentials);

            // Swaply API usually wraps in success response
            if (response.data && response.data.data && response.data.data.token) {
                login(response.data.data.token);
                navigate('/');
            } else {
                throw new Error("Token alınmadı");
            }
        } catch (err) {
            console.error("Login xətası:", err);
            if (err.response?.data?.message === "User Banned") {
                setError("İstifadəçinin girişinə müvəqqəti qadağa qoyulub");
            } else {
                setError("E-poçt və ya şifrə yanlışdır.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '4rem var(--container-padding)', display: 'flex', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={{ padding: '3rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', width: '100%', maxWidth: '450px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Xoş Gəlmisiniz</h1>
                    <p style={{ color: 'var(--text-light)' }}>Swaply hesabınıza daxil olun</p>
                </div>

                {error && (
                    <div style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}><Mail size={16} /> E-poçt</label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="mail@example.com"
                            value={credentials.email}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}><Lock size={16} /> Şifrə</label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', width: '100%', padding: '14px', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
                        <LogIn size={20} /> {loading ? "Daxil olunur..." : "Daxil ol"}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    Hələ hesabınız yoxdur? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Qeydiyyatdan keçin</Link>
                </div>
            </motion.div>
        </div>
    );
};

const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
    color: 'var(--primary)'
};

const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    backgroundColor: '#f9f9f9',
    outline: 'none',
    transition: 'var(--transition)'
};

export default Login;
