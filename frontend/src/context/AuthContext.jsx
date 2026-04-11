import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

const redirectToLogin = () => {
    if (window.location.pathname !== '/login') {
        window.location.replace('/login');
    }
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

                // Extra server-side validation so invalid JWTs are logged out immediately on app load.
                const profileResponse = await fetch('/api/profile', {
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
