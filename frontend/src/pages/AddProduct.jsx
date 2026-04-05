import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, MapPin, Tag, Info, Check } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const AddProduct = () => {
    const navigate = useNavigate();
    const [images, setImages] = useState([]); // { file, preview } objects
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

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

    const { user } = useContext(AuthContext);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const remainingSlots = 10 - images.length;
        const filesToAdd = files.slice(0, remainingSlots);

        const newItems = filesToAdd.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setImages((prev) => [...prev, ...newItems]);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 2500;
                    const MAX_HEIGHT = 2500;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error("Canvas to Blob conversion failed"));
                            return;
                        }
                        resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', 0.95);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!user || !user.id) {
            alert("Elan yerləşdirmək üçün sistemə daxil olmalısınız.");
            setLoading(false);
            return;
        }

        try {
            const compressedImages = [];
            for (let i = 0; i < images.length; i++) {
                setLoadingMessage(`Şəkillər optimallaşdırılır (${i + 1}/${images.length})...`);
                const compressed = await compressImage(images[i].file);
                compressedImages.push(compressed);
            }

            setLoadingMessage('Məhsul yaradılır...');

            const formDataPayload = new FormData();
            
            const productData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                categoryId: parseInt(formData.categoryId),
                cityId: parseInt(formData.cityId),
                isNew: formData.isNew,
                isDelivery: formData.isDelivery,
                userId: user.id
            };
            
            formDataPayload.append('request', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
            
            compressedImages.forEach(file => {
                formDataPayload.append('files', file);
            });

            await api.post(`/user/${user.id}/product/create`, formDataPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setLoadingMessage('Məhsul uğurla yaradıldı!');
            alert("Elan uğurla yerləşdirildi!");
            navigate("/");
        } catch (error) {
            console.error('Xəta:', error);
            alert('Məhsul yaradılarkən xəta baş verdi: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '3rem 20px', maxWidth: '800px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={{ padding: '2.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}
            >
                <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Yeni Elan Yaradın</h1>
                <p style={{ color: 'var(--text-light)', marginBottom: '2.5rem' }}>Eşyalarınızı Swaply-də sürətli və asan satın.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Camera size={18} /> Şəkillər (Maksimum 10)
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                            {images.map((img, idx) => (
                                <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                                    <img src={img.preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                        type="button"
                                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                        style={{ position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: '12px' }}
                                    >✕</button>
                                </div>
                            ))}
                            {images.length < 10 && (
                                <label style={{
                                    aspectRatio: '1',
                                    border: '2px dashed var(--border)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--text-light)',
                                    transition: 'var(--transition)'
                                }}>
                                    <PlusCircle size={30} />
                                    <span style={{ fontSize: '0.8rem', marginTop: '5px' }}>Əlavə et</span>
                                    <input type="file" onChange={handleImageUpload} hidden multiple accept="image/*" />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}><Tag size={16} /> Başlıq</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Məs: iPhone 15 Pro, 256GB" style={inputStyle} />
                        </div>

                        <div className="form-item">
                            <label style={labelStyle}>Kateqoriya</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleChange} style={inputStyle}>
                                {categories.map((cat, idx) => (
                                    <option key={idx} value={idx}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-item">
                            <label style={labelStyle}>Qiymət (₼)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0.01" step="0.01" placeholder="0" style={inputStyle} />
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
                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Məhsul haqqında ətraflı məlumat yazın..." rows="5" style={inputStyle}></textarea>
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

                    <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', width: '100%', padding: '15px', opacity: loading ? 0.7 : 1 }}>
                        <Check size={20} /> {loading ? loadingMessage : "Elanı Yerləşdir"}
                    </button>
                </form>
            </motion.div>
            <style>{`
                @media (max-width: 640px) {
                    .form-grid { grid-template-columns: 1fr !important; }
                    .form-item { grid-column: span 2 !important; }
                    .glass { padding: 1.5rem !important; }
                }
            `}</style>
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
    transition: 'var(--transition)',
    fontSize: '1rem'
};

const PlusCircle = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

export default AddProduct;
