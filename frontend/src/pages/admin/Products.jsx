import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Trash2, Eye, ShieldAlert, CheckCircle2, MoreVertical, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/all');
                setProducts(response.data.data.content || []);
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleDelete = async (productId) => {
        if (!window.confirm('Delete this product permanently?')) return;

        try {
            await api.delete(`/user/delete-from-db/${productId}`);
            setProducts(products.filter(p => p.id !== productId));
            alert('Product deleted successfully');
        } catch (error) {
            console.error("Error deleting product", error);
            alert('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading-state">Loading inventory...</div>;

    return (
        <div className="admin-products-container">
            <header className="page-header">
                <div>
                    <h1>Product Catalog</h1>
                    <p>Manage and moderate all active listings on Swaply</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="product-table-wrapper glass">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Product Info</th>
                            <th>Status</th>
                            <th>Price/Value</th>
                            <th>Provider Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="empty-table-row">No products found.</td>
                            </tr>
                        ) : (
                            filteredProducts.map((p, index) => (
                                <tr key={p.id || index} className="table-row animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <td className="p-info-td">
                                        <div className="p-cell-content">
                                            {p.imageUrls && p.imageUrls[0] ? (
                                                <img src={p.imageUrls[0]} alt={p.title} className="p-thumb" />
                                            ) : (
                                                <div className="p-thumb-placeholder"><ShoppingBag size={20} /></div>
                                            )}
                                            <div className="p-text">
                                                <div className="name-row">
                                                    <strong>{p.title}</strong>
                                                    <a href={`/product/${p.id}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} /></a>
                                                </div>
                                                <span className="p-category">{p.category || 'General'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge-status ${p.status?.toLowerCase() || 'active'}`}>
                                            {p.status || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="p-value">
                                            <span>₼{p.price || '0.00'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="provider-email">{p.userEmail || 'N/A'}</span>
                                    </td>
                                    <td>
                                        <div className="action-cell">
                                            <button className="icon-btn danger" onClick={() => handleDelete(p.id)} title="Delete Listing">
                                                <Trash2 size={18} />
                                            </button>
                                            <button className="icon-btn" title="Flag Listing">
                                                <ShieldAlert size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;