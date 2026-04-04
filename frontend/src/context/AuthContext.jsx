import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // ── Patient Auth (Original) ───────────────────────────────────────────
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    // ── Pharmacist Auth (Added) ───────────────────────────────────────────
    const [pharmacist, setPharmacist] = useState(() => {
        try {
            const stored = localStorage.getItem('nabha_pharmacist');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [pharmacistToken, setPharmacistToken] = useState(() => localStorage.getItem('nabha_pharmacist_token') || null);

    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    // Sync axios headers (prioritize patient for general sites)
    useEffect(() => {
        const activeToken = token; // Use patient token by default for general API
        if (activeToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${activeToken}`;
        } else if (!pharmacistToken) {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token, pharmacistToken]);

    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        if (jwtToken) localStorage.setItem('token', jwtToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setAuthModalOpen(false);
    };

    const loginPharmacist = (data, jwt) => {
        setPharmacist(data);
        setPharmacistToken(jwt);
        localStorage.setItem('nabha_pharmacist', JSON.stringify(data));
        localStorage.setItem('nabha_pharmacist_token', jwt);
    };

    const logoutPharmacist = () => {
        setPharmacist(null);
        setPharmacistToken(null);
        localStorage.removeItem('nabha_pharmacist');
        localStorage.removeItem('nabha_pharmacist_token');
    };

    return (
        <AuthContext.Provider value={{ 
            user, token, login, logout, 
            pharmacist, pharmacistToken, loginPharmacist, logoutPharmacist,
            isAuthModalOpen, setAuthModalOpen 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
