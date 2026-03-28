import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, UserPlus, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', token: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/send-code', { email: formData.email });
            setStep(2);
        } catch (err) {
            console.error("Kod göndərmə xətası:", err);
            setError(err.response?.data?.message || "Kod göndərilə bilmədi. Zəhmət olmasa bir daha cəhd edin.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/verify', { email: formData.email, token: formData.token });
            // Backend boolean qaytarır (və ya success: true)
            if (response.data === true || response.data?.data === true) {
                setStep(3);
            } else {
                setError("Daxil etdiyiniz kod yanlışdır.");
            }
        } catch (err) {
            console.error("Təsdiqləmə xətası:", err);
            setError(err.response?.data?.message || "Doğrulama zamanı xəta baş verdi.");
        } finally {
            setLoading(false);
        }
    };

    const handleFinalRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password.length < 8) {
            setError("Şifrə ən azı 8 simvol olmalıdır.");
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            if (response.data && response.data.data && response.data.data.token) {
                login(response.data.data.token);
                navigate('/');
            } else {
                throw new Error("Məlumat düzgün alınmadı");
            }
        } catch (err) {
            console.error("Qeydiyyat xətası:", err);
            setError(err.response?.data?.message || "Qeydiyyat zamanı xəta baş verdi.");
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}><Mail size={16} /> E-poçt</label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="mail@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', width: '100%', padding: '14px', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
                            <Mail size={20} /> {loading ? "Kod göndərilir..." : "Təsdiq kodu göndər"}
                        </button>
                    </form>
                );
            case 2:
                return (
                    <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}><Lock size={16} /> Təsdiq kodu</label>
                            <input
                                type="text"
                                name="token"
                                required
                                maxLength="6"
                                placeholder="Emaildəki kodu daxil edin"
                                value={formData.token}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                                <strong>{formData.email}</strong> ünvanına göndərilən 6 rəqəmli kodu daxil edin.
                            </p>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', width: '100%', padding: '14px', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
                            <CheckCircle2 size={20} /> {loading ? "Yoxlanılır..." : "Kodu təsdiqlə"}
                        </button>
                        <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '0.9rem' }}>
                            Geri qayıt
                        </button>
                    </form>
                );
            case 3:
                return (
                    <form onSubmit={handleFinalRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}><User size={16} /> Ad, Soyad</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Məs: Elcan Muradov"
                                value={formData.name}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}><Phone size={16} /> Telefon nömrəsi</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                placeholder="0512345678 (10 rəqəm)"
                                maxLength="10"
                                value={formData.phone}
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
                                placeholder="Ən azı 8 simvol"
                                value={formData.password}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', width: '100%', padding: '14px', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
                            <UserPlus size={20} /> {loading ? "Yaradılır..." : "Qeydiyyatı tamamla"}
                        </button>
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container" style={{ padding: '4rem var(--container-padding)', display: 'flex', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={{ padding: '2.5rem 1.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', width: '100%', maxWidth: '500px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Qeydiyyat</h1>
                    <p style={{ color: 'var(--text-light)' }}>
                        {step === 1 && "E-poçt ünvanınızı daxil edin"}
                        {step === 2 && "E-poçtunuzu təsdiqləyin"}
                        {step === 3 && "Məlumatlarınızı tamamlayın"}
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '2rem' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: step >= s ? 'var(--accent)' : 'var(--border)',
                            transition: 'all 0.3s ease'
                        }} />
                    ))}
                </div>

                {error && (
                    <div style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {renderStep()}

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    Artıq hesabınız var? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Daxil olun</Link>
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

export default Register;
