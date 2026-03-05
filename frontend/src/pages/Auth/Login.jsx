import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/phoneFormatter';
import './Auth.css';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhone(formatted);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple mock login
        if (phone === '050 000 00 00' && password === 'admin123') {
            login({ id: 1, phone, name: 'Admin User', role: 'ADMIN' });
            navigate('/admin');
        } else {
            login({ id: 2, phone, name: 'Normal User', role: 'USER' });
            navigate('/');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <h2>Xoş Gəlmisiniz!</h2>
                <p>Swaply hesabınıza daxil olun</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <Phone size={20} />
                        <input
                            type="text"
                            placeholder="Telefon (0XX XXX XX XX)"
                            value={phone}
                            onChange={handlePhoneChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <Lock size={20} />
                        <input
                            type="password"
                            placeholder="Şifrə"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary auth-submit">Daxil Ol</button>
                </form>

                <p className="auth-footer">
                    Hesabınız yoxdur? <Link to="/register">Qeydiyyatdan keçin</Link>
                </p>
            </div>
        </div>
    );
};

export { Login };
