import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CategoryBar from '../../components/layout/CategoryBar';
import ProductCard from '../../components/product/ProductCard';
import { productService } from '../../services/api';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productService.getAll();
                // Since backend might return a different structure, ensure we have an array
                setProducts(Array.isArray(data) ? data : (data?.data || []));
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="home-page">
            <Navbar />
            <Hero />
            <CategoryBar />

            <main className="container">
                <section className="featured-products">
                    <div className="section-header">
                        <h2>Premium Elanlar</h2>
                        <button className="view-all">Hamisina bax</button>
                    </div>

                    {loading ? (
                        <div className="loading-state">Yuklenir...</div>
                    ) : (
                        <div className="product-grid">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
};

const Hero = () => (
    <section className="hero">
        <div className="container hero-content">
            <motion.div
                className="hero-text"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1>Axtardığın hər şey <span>Swaply</span>-də!</h1>
                <p>İkinci əl əşyalarını sat, yenisini sərfəli qiymətə al. Asan, sürətli və təhlükəsiz.</p>
                <div className="hero-btns">
                    <button className="btn-primary">İndi Al</button>
                    <button className="btn-accent">Satış Et</button>
                </div>
            </motion.div>
            <motion.div
                className="hero-image"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800" alt="Marketplace" />
            </motion.div>
        </div>
    </section>
);

export default Home;
