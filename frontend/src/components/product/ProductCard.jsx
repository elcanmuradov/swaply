import React from 'react';
import { MapPin, Clock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    return (
        <motion.div
            className="product-card"
            whileHover={{ y: -8 }}
        >
            <Link to={`/product/${product.id}`}>
                <div className="product-image">
                    <img src={product.imageUrls[0]} alt={product.title} />
                    {product.newProduct && <span className="badge-new">Yeni</span>}
                    <button className="wishlist-btn" onClick={(e) => e.preventDefault()}>
                        <Heart size={20} />
                    </button>
                </div>

                <div className="product-info">
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-price">{product.price} AZN</p>

                    <div className="product-meta">
                        <div className="meta-item">
                            <MapPin size={14} />
                            <span>{product.city}</span>
                        </div>
                        <div className="meta-item">
                            <Clock size={14} />
                            <span>{product.createdAt.split(' ')[0]}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
