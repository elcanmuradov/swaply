import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User as UserIcon,
    AlertCircle,
    Wallet,
    Package,
    History,
    CreditCard,
    Settings,
    ShieldCheck,
    Plus,
    FileText,
    LogOut,
    ChevronRight,
    Clock,
    EyeOff,
    Archive,
    MapPin,
    Camera
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const PRODUCT_PREVIEW_CACHE_KEY = 'productImagePreviewCache';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingProducts, setFetchingProducts] = useState(false);
    const [activeTab, setActiveTab] = useState('elanlar');
    const [activeSubTab, setActiveSubTab] = useState('ACTIVE');

    const getCachedPreviewImage = (productId) => {
        const cache = JSON.parse(sessionStorage.getItem(PRODUCT_PREVIEW_CACHE_KEY) || '{}');
        const entry = cache?.[productId];
        if (!entry || !Array.isArray(entry.urls) || entry.urls.length === 0) return null;
        if (entry.expiresAt && entry.expiresAt <= Date.now()) return null;
        return entry.urls[0] || null;
    };

    // Password change state
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1000;
                    const MAX_HEIGHT = 1000;
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
                        resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
                    }, 'image/jpeg', 0.9);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Optimistik yeniləmə - dərhal ekranda göstər
        const fakePreview = URL.createObjectURL(file);
        setProfile(prev => ({ ...prev, profileImageUrl: fakePreview }));

        setUploadingPhoto(true);
        try {
            const compressed = await compressImage(file);
            
            const formData = new FormData();
            formData.append('file', compressed);

            // Backend-ə göndəririk. Backend 200 OK qaytaracaq, yükləmə background-da gedəcək.
            await api.put('/profile/changePhoto', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Background-da yükləndiyi üçün dərhal alert verməyə bilərik, yaxud "Yüklənir..." mesajı qala bilər.
            // setProfile(prev => ({ ...prev, profileImageUrl: imageUrl })); // Bu artıq backend tərəfindən async ediləcək
            
        } catch (error) {
            console.error('Profil şəkli dəyişdirilərkən xəta:', error);
            alert('Xəta baş verdi. Yenidən cəhd edin.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordData.oldPassword || !passwordData.newPassword) {
            alert('Köhnə və yeni şifrəni daxil edin');
            return;
        }

        setUpdatingPassword(true);
        try {
            await api.post('/profile/change-password', passwordData);
            alert('Şifrə uğurla yeniləndi');
            setPasswordData({ oldPassword: '', newPassword: '' });
        } catch (error) {
            console.error('Şifrə dəyişdirilərkən xəta:', error);
            alert('Köhnə şifrə yanlışdır və ya xəta baş verdi');
        } finally {
            setUpdatingPassword(false);
        }
    };

    const subTabs = [
        { id: 'ACTIVE', label: 'Aktiv' },
        { id: 'DELETED', label: 'Silinmiş' },
        { id: 'EXPIRED', label: 'Müddəti Bitmiş' },
    ];

    const fetchProducts = async (status) => {
        if (!user) return;
        setFetchingProducts(true);
        try {
            const res = await api.get(`/user/${user.id}/product/status/${status}`);
            setProducts(res.data.data.content || []);
        } catch (error) {
            console.error(`Error fetching ${status} products:`, error);
        } finally {
            setFetchingProducts(false);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProfileData = async () => {
            try {
                const profileRes = await api.get('/profile');
                setProfile(profileRes.data.data);
            } catch (error) {
                console.error("Profil məlumatları yüklənərkən xəta:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user, navigate]);

    useEffect(() => {
        if (activeTab === 'elanlar') {
            fetchProducts(activeSubTab);
        }
    }, [user, activeTab, activeSubTab]);

    const handleDelete = async (productId) => {
        if (!window.confirm("Bu elanı silmək istədiyinizə əminsiniz?")) return;

        try {
            await api.delete(`/user/${user.id}/product/${productId}/delete`);
            // Yenilə
            fetchProducts(activeSubTab);
        } catch (error) {
            console.error("Elan silinərkən xəta:", error);
            alert("Xəta baş verdi.");
        }
    };

    const handleReactivate = async (productId) => {
        if (!window.confirm("Bu elanı yenidən aktiv etmək istəyirsiniz?")) return;

        try {
            await api.put(`/user/${user.id}/product/${productId}/set-active`);
            alert("Elan yenidən aktiv edildi.");
            fetchProducts(activeSubTab);
        } catch (error) {
            console.error("Elan aktiv edilərkən xəta:", error);
            alert("Xəta baş verdi.");
        }
    };

    if (!user) return null;

    const isVerified = profile?.emailVerified || false;

    const mainTabs = [
        { id: 'elanlar', icon: <Package size={20} />, label: 'Elanlar' },
        { id: 'profil', icon: <UserIcon size={20} />, label: 'Profil' },
    ];

    if (loading) {
        return (
            <div className="container" style={{ padding: '5rem 20px', textAlign: 'center' }}>
                <div className="animate-spin" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Yüklənir...</p>
            </div>
        );
    }

    return (
        <>
        <div className="profile-container" style={{ backgroundColor: '#f6f7f8', minHeight: 'calc(100vh - 80px)', padding: '2rem 1rem' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>


                {/* Main Tabs Navigation */}
                <div className="tabs-nav" style={{
                    display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '1px',
                    overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px 8px 0 0',
                    scrollbarWidth: 'none'
                }}>
                    {mainTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem 1.5rem',
                                color: activeTab === tab.id ? 'var(--accent)' : '#666',
                                borderBottom: activeTab === tab.id ? '3px solid var(--accent)' : '3px solid transparent',
                                fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <span style={{ color: activeTab === tab.id ? 'var(--accent)' : '#999' }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Sub Tabs (only for Elanlar) */}
                {activeTab === 'elanlar' && (
                    <div style={{
                        display: 'flex', borderBottom: '1px solid #eee', backgroundColor: '#fff',
                        overflowX: 'auto', scrollbarWidth: 'none'
                    }}>
                        {subTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSubTab(tab.id)}
                                style={{
                                    padding: '1rem 1.5rem', color: activeSubTab === tab.id ? '#2196f3' : '#666',
                                    borderBottom: activeSubTab === tab.id ? '2px solid #2196f3' : '2px solid transparent',
                                    fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content Area */}
                <div className="content-area" style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '0 0 8px 8px', border: '1px solid #eee', borderTop: 'none', minHeight: '400px' }}>
                    {activeTab === 'elanlar' && activeSubTab === 'ACTIVE' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button
                                onClick={() => navigate('/add-product')}
                                style={{
                                    backgroundColor: '#B38B59', color: '#fff', padding: '10px 18px',
                                    borderRadius: '6px', fontWeight: 700, fontSize: '0.95rem',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                <Plus size={18} /> Yeni elan
                            </button>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab + activeSubTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'elanlar' ? (
                                fetchingProducts ? (
                                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                                        <div className="animate-spin" style={{ display: 'inline-block', width: '24px', height: '24px', border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                    </div>
                                ) : products.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                                        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>Bu bölmədə elan yoxdur</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {products.map((product) => (
                                            <div
                                                key={product.id}
                                                className="product-item"
                                                style={{
                                                    display: 'flex',
                                                    gap: '1.5rem',
                                                    padding: '1.2rem',
                                                    borderRadius: '12px',
                                                    border: '1px solid #eee',
                                                    backgroundColor: '#fff',
                                                    transition: 'all 0.2s',
                                                    alignItems: 'center',
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Left: Image */}
                                                <div className="product-img" style={{ width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f0f0f0' }}>
                                                    <img
                                                        src={product.imageUrls?.[0] || getCachedPreviewImage(product.id) || 'https://via.placeholder.com/120x90'}
                                                        alt={product.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>

                                                {/* Center: Details */}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, textTransform: 'uppercase' }}>
                                                            {product.category?.replace('_', ' ')}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            backgroundColor: product.status === 'ACTIVE' ? '#e8f5e9' : '#f5f5f5',
                                                            color: product.status === 'ACTIVE' ? '#2e7d32' : '#666',
                                                            fontWeight: 600
                                                        }}>
                                                            {product.status}
                                                        </span>
                                                    </div>
                                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333', marginBottom: '4px' }}>{product.title}</h3>
                                                    <div className="product-meta" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.1rem' }}>{product.price} AZN</span>
                                                        <span style={{ fontSize: '0.85rem', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Clock size={14} /> {new Date(product.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <span style={{ fontSize: '0.85rem', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <MapPin size={14} /> {product.city || 'Bakı'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="product-actions" style={{ display: 'flex', gap: '0.8rem' }}>
                                                    <button
                                                        onClick={() => navigate(`/product/${product.id}`)}
                                                        style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                                                    >
                                                        Bax
                                                    </button>
                                                    {activeSubTab === 'ACTIVE' && (
                                                        <button
                                                            onClick={() => navigate(`/edit-product/${product.id}`)}
                                                            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e3f2fd', backgroundColor: '#fff', color: '#2196f3', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                            Düzəliş et
                                                        </button>
                                                    )}
                                                    {activeSubTab === 'DELETED' ? (
                                                        <button
                                                            onClick={() => handleReactivate(product.id)}
                                                            style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                            Bərpa et
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                            Sil
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div style={{ color: '#999' }}>
                                    {activeTab === 'profil' ? (
                                        <div style={{ textAlign: 'left', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
                                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '3rem' }}>
                                                <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                                                    {uploadingPhoto ? (
                                                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <img 
                                                                src={profile?.profileImageUrl || 'https://static.vecteezy.com/system/resources/previews/007/335/692/non_2x/account-icon-template-vector.jpg'} 
                                                                alt={profile?.name}
                                                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                                            />
                                                            <label style={{ 
                                                                position: 'absolute', bottom: '0', right: '0', 
                                                                backgroundColor: 'var(--accent)', color: '#fff', 
                                                                width: '32px', height: '32px', borderRadius: '50%', 
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                                transition: 'transform 0.2s'
                                                            }}>
                                                                <Camera size={16} />
                                                                <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                                                            </label>
                                                        </>
                                                    )}
                                                </div>
                                                <div>
                                                    <h2 style={{ fontSize: '1.4rem', color: '#333' }}>{profile?.name || user?.name}</h2>
                                                    <p style={{ color: '#666' }}>{profile?.email || user?.email}</p>
                                                    <p style={{ color: '#999', fontSize: '0.85rem', marginTop: '4px' }}>{profile?.phone}</p>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee', marginTop: '1rem' }}>
                                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', color: '#333' }}>Şifrəni dəyiş</h3>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>Köhnə şifrə</label>
                                                            <input
                                                                type="password"
                                                                value={passwordData.oldPassword}
                                                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', outline: 'none' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>Yeni şifrə</label>
                                                            <input
                                                                type="password"
                                                                value={passwordData.newPassword}
                                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', outline: 'none' }}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={handlePasswordChange}
                                                            disabled={updatingPassword}
                                                            style={{
                                                                backgroundColor: 'var(--accent)', color: '#fff', padding: '10px',
                                                                borderRadius: '4px', border: 'none', fontWeight: 600, cursor: 'pointer',
                                                                opacity: updatingPassword ? 0.7 : 1
                                                            }}
                                                        >
                                                            {updatingPassword ? 'Yüklənir...' : 'Şifrəni yenilə'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <button onClick={logout} style={{
                                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem',
                                                    backgroundColor: '#fff5f5', color: '#e53e3e', borderRadius: '8px',
                                                    width: '100%', fontWeight: 600, border: '1px solid #fed7d7'
                                                }}>
                                                    <LogOut size={18} /> Hesabdan çıx
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ marginBottom: '1.5rem', opacity: 0.5 }}>
                                                <FileText size={60} />
                                            </div>
                                            <p>Bu bölmə hələ ki boşdur.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
            <style>{`
                @media (max-width: 768px) {
                    .profile-container { padding: 1rem 0 !important; }
                    .content-area { padding: 1rem !important; }
                    .product-item { flex-direction: column; align-items: stretch !important; gap: 1rem !important; }
                    .product-img { width: 100% !important; height: 180px !important; }
                    .product-actions { width: 100%; justify-content: space-between; border-top: 1px solid #eee; padding-top: 1rem; }
                    .product-actions button { flex: 1; text-align: center; }
                    .product-meta { flex-direction: column; align-items: flex-start !important; gap: 0.5rem !important; }
                }
                @media (max-width: 480px) {
                    .tabs-nav button { padding: 0.8rem 1rem !important; font-size: 0.85rem !important; }
                }
            `}</style>
        </>
    );
};

export default Profile;
