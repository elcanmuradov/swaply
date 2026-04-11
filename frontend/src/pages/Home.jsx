import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../api/axios';

const PRODUCT_PREVIEW_CACHE_KEY = 'productImagePreviewCache';

const Home = () => {
    const categories = [
        { id: 'ALL', label: 'Hamısı' },
        { id: 'ELECTRONICS', label: 'Elektronika' },
        { id: 'WEAR', label: 'Geyim' },
        { id: 'HOME_AND_GARDEN', label: 'Ev & Bağ' },
        { id: 'CHILDREN', label: 'Uşaq aləmi' },
        { id: 'SPORT', label: 'İdman' },
        { id: 'CAR', label: 'Avtomobillər' },
        { id: 'BOOK', label: 'Kitab' },
        { id: 'BEAUTY', label: 'Gözəllik & Sağlamlıq' },
        { id: 'TOY', label: 'Oyuncaqlar' },
        { id: 'FOOD', label: 'Qida & İçki' },
        { id: 'ANIMALS', label: 'Heyvanlar aləmi' },
        { id: 'ART', label: 'İncəsənət' },
        { id: 'BUSINESS', label: 'Biznes' },
        { id: 'SERVICES', label: 'Xidmətlər' },
        { id: 'OTHERS', label: 'Digər' }
    ];

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [previewCache, setPreviewCache] = useState({});

    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search');

    const cleanAndSetPreviewCache = (rawCache) => {
        const now = Date.now();
        const cleaned = Object.entries(rawCache || {}).reduce((acc, [productId, entry]) => {
            if (entry && Array.isArray(entry.urls) && entry.urls.length > 0 && (!entry.expiresAt || entry.expiresAt > now)) {
                acc[productId] = entry;
            }
            return acc;
        }, {});
        setPreviewCache(cleaned);
        sessionStorage.setItem(PRODUCT_PREVIEW_CACHE_KEY, JSON.stringify(cleaned));
        return cleaned;
    };

    const fetchProducts = async (category = 'ALL', search = null, page = 0) => {
        setLoading(true);
        try {
            let url;
            const size = 30;
            if (search) {
                url = `/search?q=${encodeURIComponent(search)}`;
            } else {
                url = category === 'ALL' ? `/?page=${page}&size=${size}` : `/category/${category}?page=${page}&size=${size}`;
            }
            const response = await api.get(url);

            if (search) {
                const fetchedProducts = response.data.data || [];
                setProducts(fetchedProducts);
                setTotalPages(0);

                const currentCache = JSON.parse(sessionStorage.getItem(PRODUCT_PREVIEW_CACHE_KEY) || '{}');
                const prunedCache = { ...currentCache };
                fetchedProducts.forEach((product) => {
                    if (product?.id && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
                        delete prunedCache[product.id];
                    }
                });
                cleanAndSetPreviewCache(prunedCache);
            } else {
                const fetchedProducts = response.data.data.content || [];
                setProducts(fetchedProducts);
                setTotalPages(response.data.data.totalPages || 0);

                const currentCache = JSON.parse(sessionStorage.getItem(PRODUCT_PREVIEW_CACHE_KEY) || '{}');
                const prunedCache = { ...currentCache };
                fetchedProducts.forEach((product) => {
                    if (product?.id && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
                        delete prunedCache[product.id];
                    }
                });
                cleanAndSetPreviewCache(prunedCache);
            }
        } catch (error) {
            console.error("Məhsullar yüklənərkən xəta baş verdi:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Synchronize searchTerm with URL param initially
    useEffect(() => {
        if (searchQuery) {
            setSearchTerm(searchQuery);
        }
    }, [searchQuery]);

    useEffect(() => {
        const rawCache = JSON.parse(sessionStorage.getItem(PRODUCT_PREVIEW_CACHE_KEY) || '{}');
        cleanAndSetPreviewCache(rawCache);
    }, []);

    // Handle initial fetch and changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim()) {
                fetchProducts('ALL', searchTerm, 0);
            } else if (searchQuery) {
                fetchProducts('ALL', searchQuery, 0);
            } else {
                fetchProducts(selectedCategory, null, currentPage);
            }
        }, 100);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedCategory, searchQuery, currentPage]);

    // Reset pagination when category or search changes
    useEffect(() => {
        setCurrentPage(0);
    }, [selectedCategory, searchTerm]);

    return (
        <div className="animate-fade-in">
            {/* Styles for the specific search-bar class requested by user- provided by CSS or inline */}
            <style>{`
                .search-bar {
                    display: flex;
                    align-items: center;
                    background: white;
                    padding: 0.6rem 1.5rem;
                    border-radius: 3rem;
                    border: 1px solid var(--border);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    max-width: 600px;
                    margin: 0 auto;
                }
                .search-bar input {
                    border: none;
                    outline: none;
                    margin-left: 0.8rem;
                    font-size: 1rem;
                    width: 100%;
                    color: var(--text);
                }
            `}</style>

            {/* Hero / Categories section */}
            <section style={{ padding: '1rem 0', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: '65px', zIndex: 900 }} className="glass">
                <div className="container">
                    <div className="hide-scrollbar" style={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: '0.8rem',
                        padding: '0.5rem 0',
                        margin: '0 -2px',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch'
                    }}>
                        {categories.map((cat) => (
                            <motion.button
                                key={cat.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setSelectedCategory(cat.id);
                                    if (searchTerm) {
                                        setSearchTerm('');
                                        navigate('/');
                                    }
                                }}
                                style={{
                                    padding: '8px 18px',
                                    borderRadius: '20px',
                                    backgroundColor: (selectedCategory === cat.id && !searchTerm) ? 'var(--accent)' : '#f3f4f6',
                                    color: (selectedCategory === cat.id && !searchTerm) ? '#fff' : 'var(--text)',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    border: 'none',
                                    transition: 'var(--transition)',
                                    cursor: 'pointer',
                                    scrollSnapAlign: 'start'
                                }}
                            >
                                {cat.label}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="container" style={{ marginTop: '2rem' }}>
                <div className="search-bar">
                    <Search size={18} style={{ color: 'var(--text-light)' }} />
                    <input
                        type="text"
                        placeholder="Search by title or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {searchTerm && (
                    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-light)' }}>
                            "{searchTerm}" üçün nəticələr
                        </h3>
                        <button onClick={() => { setSearchTerm(''); navigate('/'); }} style={{ color: 'var(--accent)', fontWeight: 600 }}>Təmizlə</button>
                    </div>
                )}

                <div className="responsive-grid" style={{ marginTop: '2rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1/-1' }}>Yüklənir...</div>
                    ) : products.length > 0 ? (
                        products.map((product) => (
                            <ListingCard key={product.id} product={product} previewCache={previewCache} />
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1/-1', color: 'var(--text-light)' }}>Heç bir məhsul tapılmadı.</div>
                    )}
                </div>

                {totalPages > 1 && !searchTerm && (
                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', paddingBottom: '3rem' }}>
                        <button
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '10px',
                                backgroundColor: currentPage === 0 ? '#eee' : 'var(--surface)',
                                border: '1px solid var(--border)',
                                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Əvvəlki
                        </button>
                        <span style={{ fontWeight: 600 }}>
                            Səhifə {currentPage + 1} / {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages - 1}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '10px',
                                backgroundColor: currentPage === totalPages - 1 ? '#eee' : 'var(--surface)',
                                border: '1px solid var(--border)',
                                cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Növbəti
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

const ListingCard = ({ product, previewCache }) => {
    const navigate = useNavigate();
    const previewImage = previewCache?.[product.id]?.urls?.[0];
    const primaryImage = product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls[0]
        : previewImage;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`/product/${product.id}`)}
            style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow)',
                position: 'relative',
                cursor: 'pointer'
            }}
        >
            <div style={{
                height: '200px',
                backgroundColor: '#e2e2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999'
            }}>
                {primaryImage ? (
                    <img src={primaryImage} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span>Şəkil yoxdur</span>
                )}
            </div>

            <div style={{ padding: '1.2rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    {product.price} ₼
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{product.city || "Bakı"}, {new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default Home;
