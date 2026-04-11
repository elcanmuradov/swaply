import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

const redirectToLogin = () => {
    if (window.location.pathname !== '/login') {
        window.location.replace('/login');
    }
};

const extractRoleText = (decoded) => {
    if (!decoded) return '';

    if (Array.isArray(decoded.role)) {
        return decoded.role.map((r) => String(r)).join(',');
    }

    if (Array.isArray(decoded.roles)) {
        return decoded.roles.map((r) => String(r)).join(',');
    }

    return String(decoded.role || decoded.roles || decoded.authorities || decoded.userRole || '');
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const decoded = jwtDecode(token);
                
                // Check if token is expired
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    logout();
                    redirectToLogin();
                    return;
                }

                const userData = {
                    ...decoded,
                    id: decoded.userId || decoded.id || decoded.sub // prefer userId from JWT
                };

                const roleText = extractRoleText(decoded).toUpperCase();
                const isAdminToken = roleText.includes('ADMIN');
                const validationUrl = isAdminToken ? '/api/admin/stats' : '/api/profile';

                // Extra server-side validation so invalid JWTs are logged out immediately on app load.
                const profileResponse = await fetch(validationUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!profileResponse.ok) {
                    logout();
                    redirectToLogin();
                    return;
                }

                setUser(userData);
            } catch (error) {
                console.error("Invalid token", error);
                logout();
                redirectToLogin();
            }
            setLoading(false);
        };

        validateToken();
    }, [token]);

    const login = (jwtToken) => {
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        try {
            const decoded = jwtDecode(jwtToken);
            setUser({
                ...decoded,
                id: decoded.userId || decoded.id || decoded.sub
            });
        } catch (error) {
            console.error("Error decoding token on login:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
