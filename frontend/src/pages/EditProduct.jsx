import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, MapPin, Tag, Info, Check, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const categories = [
        "Elektronika", "Geyim", "Ev & Bağ", "Uşaq aləmi", "İdman", "Avtomobillər",
        "Kitab", "Gözəllik & Sağlamlıq", "Oyuncaqlar", "Qida & İçki", "Heyvanlar aləmi",
        "İncəsənət", "Biznes", "Xidmətlər", "Digər"
    ];

    const cities = [
        "Bakı", "Gəncə", "Sumqayıt", "Mingəçevir", "Şəki", "Yevlax", "Lənkəran", "Şirvan", "Naftalan", "Şuşa", "Xankəndi",
        "Abşeron", "Ağcabədi", "Ağdam", "Ağdaş", "Ağstafa", "Ağsu", "Astara", "Balakən", "Bərdə", "Beyləqan", "Biləsuvar",
        "Cəbrayıl", "Cəlilabad", "Daşkəsən", "Füzuli", "Gədəbəy", "Goranboy", "Göyçay", "Göygöl", "Hacıqabul", "İmişli",
        "İsmayıllı", "Kəlbəcər", "Kürdəmir", "Laçın", "Lerik", "Masallı", "Neftçala", "Oğuz", "Qəbələ", "Qax", "Qazax",
        "Qobustan", "Quba", "Qubadlı", "Qusar", "Saatlı", "Sabirabad", "Salyan", "Şamaxı", "Şəmkir", "Siyəzən", "Tərtər",
        "Tovuz", "Ucar", "Xaçmaz", "Xızı", "Xocalı", "Xocavənd", "Yardımlı", "Zəngilan", "Zaqatala", "Zərdab",
        "Naxçıvan (Şəhər)", "Babək", "Culfa", "Kəngərli", "Ordubad", "Sədərək", "Şahbuz", "Şərur"
    ];

    const [formData, setFormData] = useState({
        title: '',
        categoryId: 0,
        price: '',
        description: '',
        cityId: 0,
        isNew: false,
        isDelivery: false
    });

    useEffect(() => {
        const fetchProductData = async () => {
            if (!user) return;
            try {
                // Not: Product service-dəki GETById endpointi istifadə edilir
                const res = await api.get(`/user/${user.id}/product/${productId}`);
                const p = res.data.data;
                
                // Form məlumatlarını doldur
                setFormData({
                    title: p.title || '',
                    categoryId: categories.indexOf(p.category) !== -1 ? categories.indexOf(p.category) : 0,
                    price: p.price || '',
                    description: p.description || '',
                    cityId: cities.indexOf(p.city) !== -1 ? cities.indexOf(p.city) : 0,
                    isNew: p.isNew === true || p.isNew === 'true' || p.isNew === 1,
                    isDelivery: p.isDelivery === true || p.isDelivery === 'true' || p.isDelivery === 1
                });
            } catch (err) {
                console.error("Məhsul yüklənərkən xəta:", err);
                setError("Məhsul məlumatlarını yükləmək mümkün olmadı.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [productId, user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                categoryId: parseInt(formData.categoryId),
                cityId: parseInt(formData.cityId),
                userId: user.id
            };

            await api.put(`/user/${user.id}/product/${productId}/update`, payload);
            alert("Məhsul uğurla yeniləndi!");
            navigate("/profile");
        } catch (err) {
            console.error("Yeniləmə xətası:", err);
            alert("Xəta baş verdi: " + (err.response?.data?.message || "Yenidən cəhd edin."));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Yüklənir...</div>;
    if (error) return <div className="container" style={{ padding: '5rem', textAlign: 'center', color: 'red' }}>{error}</div>;

    return (
        <div className="container" style={{ padding: '3rem 20px', maxWidth: '800px' }}>
            <button 
                onClick={() => navigate(-1)} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: 'var(--text-light)', marginBottom: '1.5rem', cursor: 'pointer' }}
            >
                <ArrowLeft size={18} /> Geri qayıt
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={{ padding: '2.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}
            >
                <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Elana Düzəliş Et</h1>
                <p style={{ color: 'var(--text-light)', marginBottom: '2.5rem' }}>Məhsul məlumatlarını yeniləyin.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}><Tag size={16} /> Başlıq</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle}>Kateqoriya</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleChange} style={inputStyle}>
                                {categories.map((cat, idx) => (
                                    <option key={idx} value={idx}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Qiymət (₼)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0.01" step="0.01" style={inputStyle} />
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', gridColumn: 'span 2', padding: '10px 0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 500 }}>
                                <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} style={{ width: 18, height: 18 }} />
                                Yeni məhsuldur
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 500 }}>
                                <input type="checkbox" name="isDelivery" checked={formData.isDelivery} onChange={handleChange} style={{ width: 18, height: 18 }} />
                                Çatdırılma var
                            </label>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}><Info size={16} /> Təsvir</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="5" style={inputStyle}></textarea>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}><MapPin size={16} /> Şəhər</label>
                            <select name="cityId" value={formData.cityId} onChange={handleChange} style={inputStyle}>
                                {cities.map((city, idx) => (
                                    <option key={idx} value={idx}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={submitting} className="btn-primary" style={{ justifyContent: 'center', width: '100%', padding: '15px', opacity: submitting ? 0.7 : 1 }}>
                        <Check size={20} /> {submitting ? "Yenilənir..." : "Dəyişiklikləri Saxla"}
                    </button>
                </form>
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
    backgroundColor: '#fff',
    outline: 'none',
    fontSize: '1rem'
};

export default EditProduct;
