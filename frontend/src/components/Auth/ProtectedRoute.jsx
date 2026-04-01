import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, setAuthModalOpen } = useAuth();
    const location = useLocation();

    useEffect(() => {
        // Automatically open modal if unauthenticated user tries to hit a protected route
        if (!user) {
            setAuthModalOpen(true);
        }
    }, [user, setAuthModalOpen]);

    if (!user) {
        // Redirect them temporarily to home while the modal is open
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children ? children : <Outlet />;
}
