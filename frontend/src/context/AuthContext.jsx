import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// We import socket connect/disconnect lazily to avoid circular deps
let _socketConnect = null;
let _socketDisconnect = null;
export const registerSocketHandlers = (connectFn, disconnectFn) => {
    _socketConnect = connectFn;
    _socketDisconnect = disconnectFn;
};

export const AuthProvider = ({ children }) => {
    // ── Patient Auth ───────────────────────────────────────────────────────────
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    const [pharmacist, setPharmacist] = useState(() => {
        try {
            const stored = localStorage.getItem('nabha_pharmacist');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [pharmacistToken, setPharmacistToken] = useState(() => localStorage.getItem('nabha_pharmacist_token') || null);

    // ── Admin Auth ─────────────────────────────────────────────────────────────
    const [admin, setAdmin] = useState(() => {
        try {
            const stored = localStorage.getItem('nabha_admin');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken') || null);

    // ── Doctor Auth ────────────────────────────────────────────────────────────
    const [doctor, setDoctor] = useState(() => {
        try {
            const stored = localStorage.getItem('nabha_doctor');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [doctorToken, setDoctorToken] = useState(() => localStorage.getItem('doctorToken') || null);

    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    // Sync axios headers
    useEffect(() => {
        const activeToken = token || doctorToken || pharmacistToken || adminToken;
        if (activeToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${activeToken}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token, doctorToken, pharmacistToken, adminToken]);

    // ── Socket connection: auto-join on login ──────────────────────────────────
    useEffect(() => {
        if (!_socketConnect) return;
        const userId = user?._id || user?.id;
        const pharmacistId = pharmacist?._id;
        const adminId = admin?._id;
        if (userId || pharmacistId || adminId) {
            _socketConnect({ userId, pharmacistId, adminId });
        }
    }, [user, pharmacist, admin]);

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
        if (_socketDisconnect) _socketDisconnect();
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

    const loginAdmin = (data, jwt) => {
        setAdmin(data);
        setAdminToken(jwt);
        localStorage.setItem('nabha_admin', JSON.stringify(data));
        localStorage.setItem('adminToken', jwt);
    };

    const logoutAdmin = () => {
        setAdmin(null);
        setAdminToken(null);
        localStorage.removeItem('nabha_admin');
        localStorage.removeItem('adminToken');
    };

    const loginDoctor = (data, jwt) => {
        setDoctor(data);
        setDoctorToken(jwt);
        localStorage.setItem('nabha_doctor', JSON.stringify(data));
        localStorage.setItem('doctorToken', jwt);
    };

    const logoutDoctor = () => {
        setDoctor(null);
        setDoctorToken(null);
        localStorage.removeItem('nabha_doctor');
        localStorage.removeItem('doctorToken');
    };

    return (
        <AuthContext.Provider value={{ 
            user, token, login, logout, 
            pharmacist, pharmacistToken, loginPharmacist, logoutPharmacist,
            admin, adminToken, loginAdmin, logoutAdmin,
            doctor, doctorToken, loginDoctor, logoutDoctor,
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
