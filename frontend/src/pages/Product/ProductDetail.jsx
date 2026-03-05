import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { MapPin, Clock, Phone, User, ShieldCheck, Share2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showPhone, setShowPhone] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await productService.getById(id);
                setProduct(data);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="loading-container">Yüklənir...</div>;
    if (!product) return <div className="error-container">Məhsul tapılmadı.</div>;

    const handleCallClick = () => {
        setShowPhone(true);
    };

    return (
        <div className="product-detail-page">
            <Navbar />

            <main className="container detail-content">
                <div className="breadcrumb">
                    <Link to="/">Ana səhifə</Link> / <span>{product.category}</span>
                </div>

                <div className="detail-grid">
                    <div className="detail-main">
                        <motion.div
                            className="image-gallery"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <img src={product.imageUrls[0]} alt={product.title} className="main-image" />
                        </motion.div>

                        <div className="product-description card">
                            <h3>Təsvir</h3>
                            <p>{product.description}</p>
                        </div>

                        <div className="product-features card">
                            <div className="feature">
                                <span>Vəziyyəti:</span>
                                <strong>{product.newProduct ? 'Yeni' : 'İstifadə olunmuş'}</strong>
                            </div>
                            <div className="feature">
                                <span>Çatdırılma:</span>
                                <strong>{product.delivery ? 'Var' : 'Yoxdur'}</strong>
                            </div>
                        </div>
                    </div>

                    <aside className="detail-sidebar">
                        <div className="price-card card">
                            <h1 className="detail-price">{product.price} AZN</h1>
                            <h2 className="detail-title">{product.title}</h2>

                            <div className="detail-meta">
                                <div className="meta-item">
                                    <MapPin size={16} />
                                    <span>{product.city}</span>
                                </div>
                                <div className="meta-item">
                                    <Clock size={16} />
                                    <span>{product.createdAt}</span>
                                </div>
                            </div>

                            <div className="action-btns">
                                <button
                                    className={`btn-primary call-btn ${showPhone ? 'revealed' : ''}`}
                                    onClick={handleCallClick}
                                >
                                    <Phone size={20} />
                                    {showPhone ? product.owner.phoneNumber : 'Nömrəni göstər'}
                                </button>
                                <button className="btn-accent msg-btn">
                                    Mesaj Yaz
                                </button>
                            </div>

                            <div className="secondary-btns">
                                <button className="icon-btn"><Heart size={20} /> Seçilmişlərə əlavə et</button>
                                <button className="icon-btn"><Share2 size={20} /> Paylaş</button>
                            </div>
                        </div>

                        <div className="seller-card card">
                            <div className="seller-info">
                                <div className="seller-avatar">
                                    <User size={30} />
                                </div>
                                <div>
                                    <h4>{product.owner.name}</h4>
                                    <p>Swaply-də {product.owner.createdAt}. ildən</p>
                                </div>
                            </div>
                            <div className="safety-badge">
                                <ShieldCheck size={20} />
                                <span>Təhlükəsiz Ödəniş</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetail;
