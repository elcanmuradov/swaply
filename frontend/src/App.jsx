import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import AddProduct from './pages/AddProduct';
import ProductDetail from './pages/ProductDetail';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import EditProduct from './pages/EditProduct';
import { AuthProvider } from './context/AuthContext';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import AdminLayout from './pages/admin/AdminLayout';
import Messages from './pages/admin/Messages';
import Products from './pages/admin/Products';
import Users from './pages/admin/Users';
import AdminRoute from './components/admin/AdminRoute';

const UserLayout = () => (
    <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
            <Outlet />
        </main>
        <Footer />
    </div>
);

function AppContent() {
    const location = useLocation();
    
    return (
        <Routes key={location.pathname}>
            {/* Admin Auth Route - Explicitly at top */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* User Routes inside UserLayout */}
            <Route element={<UserLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/notifications" element={<Profile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/edit-product/:productId" element={<EditProduct />} />
            </Route>

            {/* Admin Private Routes */}
            <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<Dashboard />} />
                    <Route path="/admin/products" element={<Products />} />
                    <Route path="/admin/messages" element={<Messages />} />
                    <Route path="/admin/users" element={<Users />} />
                </Route>
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
