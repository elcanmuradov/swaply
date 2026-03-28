import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            backgroundColor: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            padding: '4rem 0 2rem 0',
            marginTop: '4rem'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '3rem',
                    marginBottom: '3rem'
                }}>
                    <div>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Swaply</h3>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                            İkinci əl əşyaların güvənli və sürətli satışı üçün premium platforma.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1.2rem' }}>Kateqoriyalar</h4>
                        <ul style={{ listStyle: 'none', color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '2' }}>
                            <li>Elektronika</li>
                            <li>Avtomobil</li>
                            <li>Daşınmaz əmlak</li>
                            <li>Geyim & Moda</li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1.2rem' }}>Dəstək</h4>
                        <ul style={{ listStyle: 'none', color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '2' }}>
                            <li>Yardım merkezi</li>
                            <li>Qaydalar və Şərtlər</li>
                            <li>Məxfilik siyasəti</li>
                            <li>Bizimlə əlaqə</li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1.2rem' }}>Bizi izləyin</h4>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {/* Social icons would go here */}
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg)' }}></div>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg)' }}></div>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg)' }}></div>
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: '2rem',
                    textAlign: 'center',
                    color: 'var(--text-light)',
                    fontSize: '0.8rem'
                }}>
                    © {new Date().getFullYear()} Swaply. Bütün hüquqlar qorunur.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
