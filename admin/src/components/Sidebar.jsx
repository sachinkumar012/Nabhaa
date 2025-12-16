import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path
            ? 'bg-primary-600 text-white shadow-soft-md'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white';
    };

    return (
        <div className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-xl flex flex-col z-50 transition-all duration-300">
            <div className="p-6 border-b border-gray-800 flex items-center justify-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                    Nabha Admin
                </h1>
            </div>
            <nav className="flex-1 p-4 space-y-2 mt-4">
                <Link to="/dashboard" className={`block px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive('/dashboard')}`}>
                    Dashboard
                </Link>
                <Link to="/orders" className={`block px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive('/orders')}`}>
                    Orders
                </Link>
                <Link to="/doctors" className={`block px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive('/doctors')}`}>
                    Doctors
                </Link>
                <Link to="/users" className={`block px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive('/users')}`}>
                    Users
                </Link>
            </nav>
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 font-medium"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
