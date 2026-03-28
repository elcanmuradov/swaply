import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

const Favorites = () => {
    const { user, token } = useContext(AuthContext);
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        if (!user || !token) {
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/profile/favorites');
            const favoriteIds = res.data.data || res.data || [];

            if (favoriteIds.length === 0) {
                setFavoriteProducts([]);
                setLoading(false);
                return;
            }

            const actingUserId = user.id;
            const productPromises = favoriteIds.map(id => 
                api.get(`/user/${actingUserId}/product/${id}`)
                   .then(res => res.data.data || res.data)
                   .catch(err => {
                       console.error(`Failed to fetch product ${id}`, err);
                       return null;
                   })
            );

            const products = await Promise.all(productPromises);
            setFavoriteProducts(products.filter(p => p !== null));

        } catch (error) {
            console.error("Favoritləri yükləyərkən xəta baş verdi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, [user, token]);

    const handleRemoveFavorite = async (productId) => {
        try {
            await api.delete(`/profile/favorites/${productId}`);
            setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
        } catch (err) {
            console.error("Favoritdən çıxarılarkən xəta", err);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '5rem 20px', textAlign: 'center' }}>
                <div className="loader">Yüklənir...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in container" style={{ padding: '2rem 20px' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Favoritlərim</h1>
                <span>{favoriteProducts.length} məhsul</span>
            </div>

            {favoriteProducts.length > 0 ? (
                <div className="responsive-grid">
                    {favoriteProducts.map((product) => (
                        <ListingCard key={product.id} product={product} onRemove={handleRemoveFavorite} />
                    ))}
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '5rem 0',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                    <h3>Hələ heç bir elanı favoritə əlavə etməmisiniz.</h3>
                    <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Bəyəndiyiniz elanları favoritə əlavə edin ki, onları sonra asanlıqla tapasınız.</p>
                    <Link to="/" className="btn-primary">Elanlara bax</Link>
                </div>
            )}
        </div>
    );
};

const ListingCard = ({ product, onRemove }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow)',
                position: 'relative',
                cursor: 'pointer'
            }}
        >
            <button 
                onClick={(e) => { e.stopPropagation(); onRemove(product.id); }}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 10,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '35px',
                    height: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#f43f5e',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
            >
                <Trash2 size={18} />
            </button>
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                    height: '200px',
                    backgroundColor: '#e2e2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                        <img src={product.imageUrls[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ color: '#999' }}>Şəkil yoxdur</span>
                    )}
                </div>

                <div style={{ padding: '1.2rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        {product.price} ₼
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.title}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        {product.city || "Bakı"}, {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default Favorites;
