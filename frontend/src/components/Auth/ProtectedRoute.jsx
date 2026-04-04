import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, pharmacist, setAuthModalOpen } = useAuth();
    const location = useLocation();

    // Determine which auth object to use
    const isPharmacistRoute = allowedRoles && allowedRoles.includes('pharmacist');
    const isDoctorRoute = allowedRoles && allowedRoles.includes('doctor');
    
    let activeUser = user;
    if (isPharmacistRoute) activeUser = pharmacist;
    // (Add doctor if/when specialized)

    useEffect(() => {
        // Only trigger modal for patient routes if not logged in
        if (!activeUser && !isPharmacistRoute && !isDoctorRoute) {
            setAuthModalOpen(true);
        }
    }, [activeUser, isPharmacistRoute, isDoctorRoute, setAuthModalOpen]);

    if (!activeUser) {
        if (isPharmacistRoute) return <Navigate to="/pharmacist/login" replace />;
        if (isDoctorRoute) return <Navigate to="/doctor/login" replace />;
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(activeUser.role)) {
        // Current user type is logged in but doesn't have the right role for this route
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
}
