import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/api';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Admin.css';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, users: 0 });

    useEffect(() => {
        const loadData = async () => {
            const data = await productService.getAll();
            setProducts(data);
            setStats({
                total: data.length,
                pending: data.filter(p => p.status === 'PENDING').length,
                users: 156
            });
        };
        loadData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-logo">Swaply<span>Admin</span></div>
                <nav className="admin-nav">
                    <Link to="/admin" className="active"><LayoutDashboard size={20} /> Dashboard</Link>
                    <Link to="/admin/products"><ShoppingBag size={20} /> Məhsullar</Link>
                    <Link to="/admin/users"><Users size={20} /> İstifadəçilər</Link>
                    <Link to="/admin/settings"><Settings size={20} /> Tənzimləmələr</Link>
                </nav>
                <button className="admin-logout" onClick={handleLogout}>
                    <LogOut size={20} /> Çıxış
                </button>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h2>Xoş gəldin, {user?.name}</h2>
                    <div className="admin-user-info">
                        <span>{user?.email}</span>
                        <div className="admin-avatar">{user?.name[0]}</div>
                    </div>
                </header>

                <section className="admin-stats">
                    <div className="stat-card">
                        <ShoppingBag size={30} />
                        <div>
                            <h3>{stats.total}</h3>
                            <p>Ümumi Məhsul</p>
                        </div>
                    </div>
                    <div className="stat-card urgent">
                        <CheckCircle size={30} />
                        <div>
                            <h3>{stats.pending}</h3>
                            <p>Gözləyən Elanlar</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Users size={30} />
                        <div>
                            <h3>{stats.users}</h3>
                            <p>Ümumi İstifadəçi</p>
                        </div>
                    </div>
                </section>

                <section className="admin-table-container card">
                    <div className="table-header">
                        <h3>Son Elanlar</h3>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Məhsul</th>
                                <th>Kateqoriya</th>
                                <th>Qiymət</th>
                                <th>Status</th>
                                <th>Əməliyyatlar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="table-product">
                                            <img src={product.imageUrls[0]} alt="" />
                                            <span>{product.title}</span>
                                        </div>
                                    </td>
                                    <td>{product.category}</td>
                                    <td>{product.price} AZN</td>
                                    <td>
                                        <span className={`status-badge ${product.status.toLowerCase()}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="action-btn approve" title="Təsdiqlə"><CheckCircle size={18} /></button>
                                        <button className="action-btn reject" title="İmtina et"><XCircle size={18} /></button>
                                        <button className="action-btn delete" title="Sil"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
