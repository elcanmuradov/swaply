import React, { useContext, useEffect, useState, useRef } from 'react';
import { Send, Image, MoreVertical, Flag, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import axios from 'axios';

import { useLocation } from 'react-router-dom';

const Chat = () => {
    const { user, token } = useContext(AuthContext);
    const location = useLocation();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const stompClientRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const fetchConversations = async () => {
        try {
            const res = await axios.get('/api/chat/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-User-Id': user?.id
                }
            });

            const conversationUsers = res.data.map(conv => ({
                id: conv.userId,
                name: conv.name,
                lastMsg: conv.lastMessage,
                time: conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                unread: conv.unreadCount || 0
            }));

            setChats(conversationUsers);

            setSelectedChat(prev => {
                if (prev) {
                    const match = conversationUsers.find(u => u.id === prev.id);
                    return match || prev;
                }
                return prev;
            });

        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    };

    useEffect(() => {
        if (location.state?.newChatUser) {
            const newUser = location.state.newChatUser;
            setSelectedChat({
                id: newUser.id,
                name: newUser.name,
                lastMsg: 'Yeni söhbət',
                time: '',
                unread: 0
            });

            if (location.state?.product) {
                setSelectedProduct(location.state.product);
            }

            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const selectedChatRef = useRef(null);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    const fetchHistory = async (otherUserId) => {
        try {
            const res = await axios.get(`/api/chat/history/${otherUserId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-User-Id': user?.id
                }
            });
            setMessages(res.data);
            // Instant scroll to bottom when history is loaded
            setTimeout(() => scrollToBottom(true), 50);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const scrollToBottom = (instant = false) => {
        const container = messagesEndRef.current?.parentElement;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: instant ? "auto" : "smooth"
            });
        }
    };

    useEffect(() => {
        if (!token || !user) return;
        fetchConversations();

        const socket = new SockJS('/api/chat/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: () => {
                stompClient.subscribe('/user/queue/messages', (msg) => {
                    const receivedMessage = JSON.parse(msg.body);

                    // Update conversation list for ALL incoming messages
                    setChats(prev => {
                        const senderId = receivedMessage.senderId;
                        const existing = prev.find(c => c.id === senderId);
                        
                        if (existing) {
                            // Update existing chat and move to top
                            const updatedChat = {
                                ...existing,
                                lastMsg: receivedMessage.content,
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                unread: (selectedChatRef.current?.id === senderId ? 0 : (existing.unread || 0) + 1)
                            };
                            return [updatedChat, ...prev.filter(c => c.id !== senderId)];
                        } else {
                            // NEW CONVERSATION - Trigger fetch to get user info (like name)
                            fetchConversations();
                            return prev;
                        }
                    });

                    // Add to message list only if it's from current chat
                    if (selectedChatRef.current?.id === receivedMessage.senderId) {
                        setMessages(prev => [...prev, receivedMessage]);
                    }
                });
            },
            onStompError: (frame) => console.error('STOMP error', frame.headers['message'])
        });

        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            if (stompClient) stompClient.deactivate();
        };
    }, [token, user]); // Only reconnect on auth change

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    useEffect(() => {
        if (selectedChat) {
            fetchHistory(selectedChat.id);
        }
    }, [selectedChat?.id]);

    const handleSendMessage = (content = inputMessage, type = 'TEXT') => {
        if ((!content || !content.trim()) && type === 'TEXT') return;
        if (!selectedChat) return;

        const messageData = {
            receiverId: selectedChat.id,
            content: content,
            productId: selectedProduct?.id,
            messageType: type,
            read: false
        };

        if (stompClientRef.current?.connected) {
            stompClientRef.current.publish({
                destination: '/app/chat.send',
                body: JSON.stringify(messageData)
            });

            const newMsg = {
                ...messageData,
                senderId: user?.id,
                sentAt: new Date().toISOString()
            };

            setMessages(prev => [...prev, newMsg]);

            setChats(prev => {
                const existing = prev.find(c => c.id === selectedChat.id);
                const chatToUpdate = existing || selectedChat;
                
                const updatedChat = {
                    ...chatToUpdate,
                    lastMsg: type === 'TEXT' ? content : `[${type}]`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    unread: 0
                };
                
                return [updatedChat, ...prev.filter(c => c.id !== selectedChat.id)];
            });

            if (type === 'TEXT') setInputMessage("");
        }
    };

    const handleFileSelect = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);

                const response = await axios.post('/api/media/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const url = response.data.data.url;
                const type = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
                
                handleSendMessage(url, type);
            }
        } catch (error) {
            console.error("Media upload failed", error);
            alert("Şəkil və ya video yüklənərkən xəta baş verdi.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleReportMessage = async (messageId) => {
        if (!window.confirm("Bu mesajı şikayət etmək istədiyinizdən əminsiniz?")) return;
        try {
            await axios.put(`/api/chat/${messageId}/report-message`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isReported: true } : m));
            alert("Sikayetiniz qebul olundu. Tesekkurler!");
        } catch (error) {
            console.error("Failed to report message", error);
            alert("Şikayət göndərilə bilmədi.");
        }
    };

    return (
        <div className="container" style={{ padding: '1rem 20px', height: 'calc(100vh - 160px)', maxWidth: '1800px' }}>
            <div className={`glass chat-container ${selectedChat ? 'chat-selected' : ''}`} style={{
                display: 'grid',
                gridTemplateColumns: '350px 1fr',
                height: '100%',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow)'
            }}>
                {/* Sidebar */}
                <div className="chat-sidebar" style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: '1.5rem' }}>Mesajlar</h2>
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {chats.length === 0 && <div style={{ padding: '1rem', color: 'var(--text-light)' }}>Söhbət yoxdur</div>}
                        {chats.map(chat => (
                            <div key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                style={{
                                    padding: '1.2rem',
                                    borderBottom: '1px solid var(--border)',
                                    display: 'flex',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    backgroundColor: selectedChat?.id === chat.id ? 'rgba(17, 62, 33, 0.05)' : 'transparent',
                                    transition: 'var(--transition)'
                                }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                                    {chat.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{chat.time}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: chat.unread > 0 ? 'var(--text)' : 'var(--text-light)', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{chat.lastMsg}</span>
                                        {chat.unread > 0 && (
                                            <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>{chat.unread}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Message Area */}
                <div className="chat-main" style={{ display: selectedChat ? 'flex' : 'none', flexDirection: 'column', backgroundColor: 'white', height: '100%', overflow: 'hidden' }}>
                    {selectedChat ? (
                        <>
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button 
                                        className="mobile-only" 
                                        onClick={() => setSelectedChat(null)}
                                        style={{ marginRight: '8px', padding: '4px' }}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                                        {selectedChat.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span style={{ fontWeight: 700 }}>{selectedChat.name}</span>
                                </div>
                                <MoreVertical size={20} color="var(--text-light)" />
                            </div>

                            {selectedProduct && (
                                <div style={{ padding: '0.8rem 1.5rem', backgroundColor: '#fdfdfd', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <img src={selectedProduct.imageUrl} alt={selectedProduct.title} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedProduct.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>{selectedProduct.price} ₼</div>
                                    </div>
                                    <button onClick={() => setSelectedProduct(null)} style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>x</button>
                                </div>
                            )}

                            <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', overflowY: 'auto', backgroundColor: '#fcfcfc' }}>
                                {messages.map((msg, idx) => (
                                    <div key={idx} className="message-wrapper" style={{
                                        alignItems: msg.senderId === user?.id ? 'flex-end' : 'flex-start'
                                    }}>
                                        <div className="message-item" style={{
                                            alignSelf: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
                                            backgroundColor: msg.senderId === user?.id ? 'var(--primary)' : 'var(--bg)',
                                            color: msg.senderId === user?.id ? 'white' : 'var(--text)',
                                            borderRadius: msg.senderId === user?.id ? '15px 15px 0 15px' : '15px 15px 15px 0',
                                            maxWidth: '85%',
                                            padding: (msg.messageType === 'IMAGE' || msg.messageType === 'VIDEO') ? '5px' : '10px 16px'
                                        }}>
                                            {msg.messageType === 'IMAGE' ? (
                                                <img src={msg.content} alt="media" style={{ maxWidth: '100%', borderRadius: '10px', display: 'block' }} />
                                            ) : msg.messageType === 'VIDEO' ? (
                                                <video src={msg.content} controls style={{ maxWidth: '100%', borderRadius: '10px', display: 'block' }} />
                                            ) : (
                                                msg.content
                                            )}

                                            {msg.senderId !== user?.id && !msg.isReported && (
                                                <button 
                                                    className="report-button"
                                                    onClick={() => handleReportMessage(msg.id)}
                                                    title="Şikayət et"
                                                >
                                                    <Flag size={14} />
                                                </button>
                                            )}
                                        </div>
                                        {msg.isReported && (
                                            <div className="reported-badge">
                                                <AlertTriangle size={12} />
                                                Şikayət olunub
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    hidden 
                                    multiple 
                                    accept="image/*,video/*" 
                                    onChange={handleFileSelect} 
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    {uploading ? (
                                        <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid #ccc', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
                                    ) : (
                                        <Image size={24} color="var(--text-light)" />
                                    )}
                                </button>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Mesaj yazın..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            borderRadius: '20px',
                                            border: '1px solid var(--border)',
                                            backgroundColor: '#f5f5f5',
                                            outline: 'none',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                                    <Send size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fcfcfc', color: 'var(--text-light)' }} className="desktop-only">
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ opacity: 0.5 }}>Söhbətə başlamaq üçün istifadəçi seçin</h3>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @media (max-width: 768px) {
                    .chat-container { 
                        grid-template-columns: 1fr !important; 
                        height: calc(100vh - 140px) !important; 
                        width: 100% !important;
                        margin: 0 !important;
                        border-radius: 0 !important; 
                        box-shadow: none !important;
                    }
                    .chat-sidebar { display: ${selectedChat ? 'none' : 'flex'} !important; width: 100% !important; }
                    .chat-main { display: ${selectedChat ? 'flex' : 'none'} !important; width: 100% !important; }
                    .message-item { max-width: 85% !important; font-size: 0.9rem !important; }
                    .container { 
                        padding: 0 !important; 
                        margin: 0 !important; 
                        max-width: 100vw !important;
                        overflow-x: hidden !important;
                    }
                }
            `}</style>
        </div>
    );
};

const ChevronLeft = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

export default Chat;
