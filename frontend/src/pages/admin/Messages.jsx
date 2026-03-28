import React, { useState, useEffect } from 'react';
import { ShieldAlert, Ban, CheckCircle2, AlertTriangle, User, Search, Filter, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import './Messages.css';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await api.get('/admin/reported-messages');
            setMessages(response.data.data || []);
        } catch (error) {
            console.error("Error fetching reported messages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBanUser = async (message) => {
        const days = window.prompt('Ban müddətini günlərlə daxil edin:', '1');
        if (days === null) return;

        const dayCount = parseInt(days);
        if (isNaN(dayCount) || dayCount <= 0) {
            alert('Zəhmət olmasa düzgün gün sayı daxil edin.');
            return;
        }

        const seconds = dayCount * 24 * 60 * 60;

        try {
            // 1. Ban the user account
            await api.put(`/admin/users/${message.senderId}/ban?seconds=${seconds}`);
            
            // 2. Mark the specific message as banned and resolve it
            await api.put(`/admin/reported-messages/${message.id}/ban`);
            await api.put(`/admin/reported-messages/${message.id}/resolve`);
            
            alert('İstifadəçi banlandı və məruzə həll olundu.');
            fetchMessages();
        } catch (error) {
            console.error("Error in ban-resolve process", error);
            alert('Əməliyyat zamanı xəta baş verdi.');
        }
    };

    const handleResolve = async (message) => {
        try {
            await api.put(`/admin/reported-messages/${message.id}/resolve`);
            alert('Məruzə həll olundu.');
            fetchMessages();
        } catch (error) {
            console.error("Error resolving message", error);
            alert('Xəta baş verdi.');
        }
    };

    const filteredMessages = messages.filter(msg => {
        const isResolved = msg.status === 'RESOLVED';
        const matchesFilter = filter === 'all' ||
            (filter === 'pending' && !isResolved) ||
            (filter === 'resolved' && isResolved);

        const contentMatch = msg.content?.toLowerCase().includes(searchTerm.toLowerCase());
        const senderMatch = msg.senderId?.toString().toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && (contentMatch || senderMatch);
    });

    if (loading) return <div className="loading-state">Loading reports...</div>;

    return (
        <div className="messages-container">
            <header className="page-header">
                <div>
                    <h1>Reported Messages</h1>
                    <p>Review and moderate user communications</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="filter-tabs">
                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All Reports</button>
                <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
                <button className={filter === 'resolved' ? 'active' : ''} onClick={() => setFilter('resolved')}>Resolved</button>
            </div>

            <div className="reports-grid">
                {filteredMessages.length === 0 ? (
                    <div className="empty-state glass">
                        <CheckCircle2 size={48} color="var(--accent)" />
                        <h3>All Clear!</h3>
                        <p>No reported messages matching your criteria.</p>
                    </div>
                ) : (
                    filteredMessages.map((msg, index) => (
                        <div key={msg.id || index} className="report-card glass animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="report-header">
                                <div className="reporter-info">
                                    <AlertTriangle size={20} color="#f97316" />
                                    <span>Reported by <strong>{msg.reporterName || 'Anonymous'}</strong></span>
                                </div>
                                <span className={`status-badge ${msg.status?.toLowerCase() || 'pending'}`}>
                                    {msg.status || 'Pending'}
                                </span>
                            </div>

                            <div className="report-content">
                                <div className="message-preview">
                                    <p className="label">Message Content</p>
                                    <p className="msg-text">"{msg.content}"</p>
                                </div>

                                <div className="user-details">
                                    <div className="detail">
                                        <User size={16} />
                                        <span>Sender: <strong>{msg.user || 'Unknown'}</strong></span>
                                    </div>
                                    <div className="detail">
                                        <ShieldAlert size={16} />
                                        <span>Sent at: {msg.sentAt ? new Date(msg.sentAt).toLocaleString('az-AZ') : 'Unknown'}</span>
                                    </div>
                                    <div className="detail">
                                        <AlertTriangle size={16} />
                                        <span>Reported at: {msg.reportedAt ? new Date(msg.reportedAt).toLocaleString('az-AZ') : 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="report-actions">
                                <button className="btn-ban" onClick={() => handleBanUser(msg)}>
                                    <Ban size={18} />
                                    Ban User
                                </button>
                                <button className="btn-resolve" onClick={() => handleResolve(msg)}>
                                    <CheckCircle2 size={18} />
                                    Mark Resolved
                                </button>
                                <button className="btn-secondary" onClick={() => handleResolve(msg)}>
                                    <Trash2 size={18} />
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Messages;
