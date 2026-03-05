import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/phoneFormatter';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setFormData({ ...formData, phone: formatted });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple mock register
        login({ id: Date.now(), ...formData, role: 'USER' });
        navigate('/');
    };

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <h2>Hesab Yaradın</h2>
                <p>Swaply ailəsinə qoşulun</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <User size={20} />
                        <input
                            type="text"
                            placeholder="Ad Soyad"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <Phone size={20} />
                        <input
                            type="text"
                            placeholder="Telefon (0XX XXX XX XX)"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <Mail size={20} />
                        <input
                            type="email"
                            placeholder="E-poçt"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <Lock size={20} />
                        <input
                            type="password"
                            placeholder="Şifrə"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary auth-submit">Qeydiyyatdan Keç</button>
                </form>

                <p className="auth-footer">
                    Artıq hesabınız var? <Link to="/login">Daxil olun</Link>
                </p>
            </div>
        </div>
    );
};

export { Register };
