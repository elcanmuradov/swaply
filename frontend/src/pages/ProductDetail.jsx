import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, MapPin, Calendar, ShieldCheck, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [shareNotice, setShareNotice] = useState('');
    const { user, token } = useContext(AuthContext);

    const actingUserId = user?.id || "00000000-0000-0000-0000-000000000000";

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/user/${actingUserId}/product/${id}`);
                const productData = response.data.data;
                setProduct(productData);

                // Fetch seller details
                if (productData.userId) {
                    try {
                        const sellerRes = await api.get(`/profile?id=${productData.userId}`);
                        setSeller(sellerRes.data.data || sellerRes.data);
                    } catch (err) {
                        console.error("Satıcı məlumatları tapılmadı", err);
                    }
                }
            } catch (error) {
                console.error("Məhsul detalları yüklənərkən xəta baş verdi:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id, actingUserId]);

    const nextImage = () => {
        if (!product?.imageUrls?.length) return;
        setActiveImageIndex((prev) => (prev + 1) % product.imageUrls.length);
    };

    const prevImage = () => {
        if (!product?.imageUrls?.length) return;
        setActiveImageIndex((prev) => (prev - 1 + product.imageUrls.length) % product.imageUrls.length);
    };

    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (user && token) {
                try {
                    const res = await api.get('/profile/favorites');
                    const favorites = res.data.data || res.data || [];
                    setIsFavorited(favorites.includes(id));
                } catch (err) {
                    console.error("Favorit statusu yoxlanarkən xəta", err);
                }
            }
        };
        checkFavoriteStatus();
    }, [id, user, token]);

    const toggleFavorite = async () => {
        if (!user || !token) {
            navigate('/login');
            return;
        }

        try {
            if (isFavorited) {
                await api.delete(`/profile/favorites/${id}`);
            } else {
                await api.post(`/profile/favorites/${id}`);
            }
            setIsFavorited(!isFavorited);
        } catch (err) {
            console.error("Favorit statusu dəyişdirilərkən xəta", err);
        }
    };

    const handleChatClick = () => {
        if (!user || !token) {
            navigate('/login');
            return;
        }

        if (seller && product.userId !== user.id) {
            navigate('/chat', {
                state: {
                    newChatUser: {
                        id: seller.id || product.userId,
                        name: seller.name || `İstifadəçi ${product.userId.substring(0, 5)}`
                    },
                    product: {
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        imageUrl: product.imageUrls?.[0]
                    }
                }
            });
        } else if (product.userId === user.id) {
            alert("Öz məhsulunuza mesaj yaza bilməzsiniz.");
        }
    };

    const copyTextToClipboard = async (text) => {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    };

    const handleShareClick = async () => {
        const shareUrl = `${window.location.origin}/product/${id}`;

        try {
            await copyTextToClipboard(shareUrl);
            setShareNotice('Mehsul linki kopyalandi.');
        } catch (error) {
            console.error('Link kopyalanarken xeta bas verdi:', error);
            setShareNotice('Link kopyalanmadi. Yeniden cehd edin.');
        }

        window.setTimeout(() => setShareNotice(''), 2200);
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '5rem 20px', display: 'flex', justifyContent: 'center' }}>
                <div className="loader">Yüklənir...</div>
            </div>
        );
    }

    if (!product) {
        return <div className="container" style={{ padding: '5rem 20px', textAlign: 'center' }}>Məhsul tapılmadı.</div>;
    }

    const images = product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls
        : ["https://via.placeholder.com/800x600?text=Şəkil+Yoxdur"];

    const sellerName = seller?.name || `İstifadəçi ${product.userId ? product.userId.toString().substring(0, 5) : 'SM'}`;

    return (
        <div className="container" style={{ padding: '3rem 20px', maxWidth: '1200px' }}>
            <div className="product-layout">
                {/* Left Side: Image Slider */}
                <div className="image-section">
                    <motion.div
                        className="main-image-container glass"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={activeImageIndex}
                                src={images[activeImageIndex]}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                alt={product.title}
                                className="main-image"
                            />
                        </AnimatePresence>

                        {images.length > 1 && (
                            <>
                                <button className="slider-nav-btn prev" onClick={prevImage}>
                                    <ChevronLeft size={24} />
                                </button>
                                <button className="slider-nav-btn next" onClick={nextImage}>
                                    <ChevronRight size={24} />
                                </button>
                                <div className="image-pagination">
                                    {activeImageIndex + 1} / {images.length}
                                </div>
                            </>
                        )}
                    </motion.div>

                    {images.length > 1 && (
                        <div className="thumbnails-container">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`thumbnail ${idx === activeImageIndex ? 'active' : ''}`}
                                    onClick={() => setActiveImageIndex(idx)}
                                >
                                    <img src={img} alt={`thumb-${idx}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Product Info */}
                <div className="info-section">
                    <motion.div
                        className="info-card glass"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="badge">{product.category || 'General'}</div>
                        <h1 className="product-title">{product.title}</h1>
                        <div className="product-price">{product.price} ₼</div>

                        <div className="action-buttons">
                            <button className="btn-primary buy-btn">İndi Al</button>
                            <button 
                                className={`icon-btn favorite ${isFavorited ? 'active' : ''}`} 
                                onClick={toggleFavorite}
                                title={isFavorited ? "Favoritlərdən çıxar" : "Favoritlərə əlavə et"}
                            >
                                <Heart size={20} fill={isFavorited ? "#f43f5e" : "none"} color={isFavorited ? "#f43f5e" : "currentColor"} />
                            </button>
                            <button className="icon-btn share" title="Paylaş" onClick={handleShareClick}>
                                <Share2 size={20} />
                            </button>
                        </div>
                        {shareNotice && <div className="share-notice">{shareNotice}</div>}

                        <div className="product-metadata">
                            <div className="metadata-item">
                                <MapPin size={18} /> <span>{product.city || 'Bakı'}</span>
                            </div>
                            <div className="metadata-item">
                                <Calendar size={18} /> <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="metadata-item">
                                <ShieldCheck size={18} /> <span>Təhlükəsiz alış-veriş</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Seller Profile Card */}
                    <motion.div
                        className="seller-card glass"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="seller-avatar">
                            {seller?.profileImageUrl ? (
                                <img src={seller.profileImageUrl} alt={sellerName} className="seller-photo" />
                            ) : (
                                sellerName.substring(0, 2).toUpperCase()
                            )}
                        </div>
                        <div className="seller-info">
                            <div className="seller-name">{sellerName}</div>
                            <div className="seller-status">Swaply istifadəçisi</div>
                        </div>
                        <button className="btn-accent chat-btn" onClick={handleChatClick}>
                            <MessageCircle size={18} />
                            <span>Yaz</span>
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Description Section */}
            <motion.div
                className="description-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <h2 className="section-title">Məhsul Haqqında</h2>
                <div className="description-text glass">
                    {product.description}
                </div>

                <div className="product-footer-meta">
                    <span className="meta-item">№ {product.id?.split('-')[0].toUpperCase()}</span>
                    <span className="meta-item">{new Date(product.createdAt).toLocaleString('az-AZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="meta-item">Baxışların sayı: {product.viewers || 0}</span>
                </div>
            </motion.div>

            <style>{`
                .product-layout {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 2rem;
                    align-items: start;
                }

                .image-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .main-image-container {
                    position: relative;
                    height: 500px;
                    border-radius: 16px;
                    overflow: hidden;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .main-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                .slider-nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.82);
                    border: none;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    transition: all 0.2s ease;
                    z-index: 10;
                }

                .slider-nav-btn:hover {
                    background: white;
                    color: var(--primary);
                    scale: 1.1;
                }

                .slider-nav-btn.prev { left: 15px; }
                .slider-nav-btn.next { right: 15px; }

                .image-pagination {
                    position: absolute;
                    bottom: 15px;
                    right: 15px;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .thumbnails-container {
                    display: flex;
                    gap: 0.75rem;
                    overflow-x: auto;
                    padding-bottom: 5px;
                    scrollbar-width: thin;
                }

                .thumbnail {
                    width: 85px;
                    height: 85px;
                    border-radius: 10px;
                    overflow: hidden;
                    cursor: pointer;
                    border: 2px solid transparent;
                    flex-shrink: 0;
                    transition: all 0.2s ease;
                    opacity: 0.7;
                }

                .thumbnail:hover { opacity: 1; }
                .thumbnail.active {
                    border-color: var(--primary);
                    opacity: 1;
                    scale: 0.95;
                }

                .thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .info-card {
                    padding: 2.5rem;
                    border-radius: 16px;
                }

                .badge {
                    display: inline-block;
                    background: var(--light);
                    color: var(--primary);
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    text-transform: capitalize;
                }

                .product-title {
                    font-size: 2rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    color: var(--dark);
                }

                .product-price {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: var(--primary);
                    margin-bottom: 2rem;
                }

                .action-buttons {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .buy-btn {
                    flex: 1;
                    padding: 15px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    border-radius: 12px;
                }

                .icon-btn {
                    width: 54px;
                    height: 54px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: var(--text);
                }

                .icon-btn:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                    background: var(--light);
                }

                .icon-btn.favorite { color: #f43f5e; }
                .icon-btn.favorite:hover { background: #fff1f2; }

                .share-notice {
                    margin-top: -1.2rem;
                    margin-bottom: 1.2rem;
                    color: #0f766e;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .product-metadata {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    border-top: 1px solid var(--border);
                    padding-top: 1.5rem;
                }

                .metadata-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--text-light);
                    font-size: 0.95rem;
                }

                .seller-card {
                    margin-top: 1.5rem;
                    padding: 1.5rem;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .seller-avatar {
                    width: 54px;
                    height: 54px;
                    border-radius: 50%;
                    background: var(--accent);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    overflow: hidden; /* Added to clip the image to the circle */
                }

                .seller-photo {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .seller-info { flex: 1; }
                .seller-name { font-weight: 700; color: var(--dark); }
                .seller-status { font-size: 0.8rem; color: var(--text-light); }

                .chat-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    border-radius: 20px;
                    font-weight: 600;
                }

                .description-section { margin-top: 4rem; }
                .section-title { margin-bottom: 1.5rem; font-size: 1.5rem; }
                .description-text {
                    padding: 2rem;
                    border-radius: 16px;
                    line-height: 1.8;
                    color: var(--text-light);
                    white-space: pre-wrap;
                }

                .product-footer-meta {
                    margin-top: 1.5rem;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 2rem;
                    padding: 1rem 0;
                    border-top: 1px solid var(--border);
                    color: var(--text-light);
                    font-size: 0.85rem;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                }

                @media (max-width: 992px) {
                    .product-layout { grid-template-columns: 1fr; gap: 1.5rem; }
                    .main-image-container { height: 450px; }
                    .info-card { padding: 1.5rem; }
                }

                @media (max-width: 768px) {
                    .main-image-container { height: 350px; }
                    .action-buttons { flex-direction: column; gap: 1rem; }
                    .buy-btn { width: 100%; order: 1; height: 56px; }
                    .thumbnail { width: 70px; height: 70px; }
                    .seller-card { flex-direction: column; text-align: center; gap: 1rem; }
                    .chat-btn { width: 100%; justify-content: center; }
                }

                @media (max-width: 480px) {
                    .main-image-container { height: 280px; border-radius: 0; margin: 0 calc(-1 * var(--container-padding)); width: calc(100% + (2 * var(--container-padding))); }
                    .product-title { font-size: 1.5rem; }
                    .product-price { font-size: 1.8rem; }
                    .description-text { padding: 1.2rem; font-size: 0.95rem; }
                }
            `}</style>
        </div>
    );
};

export default ProductDetail;
