import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logoutAdmin } = useAuth();
    const handleLogout = () => {
        logoutAdmin();
        navigate('/admin/login');
    };

    const isActive = (path) => {
        return location.pathname === path
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white';
    };

    return (
        <>
            {/* Backdrop for Mobile */}
            <div 
              className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Panel */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-xl flex flex-col z-50 transition-transform duration-300 transform 
              ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                        Nabha Admin
                    </h1>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="lg:hidden p-1 text-gray-400 hover:text-white"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
                    {[
                        { name: 'Dashboard', path: '/admin/dashboard' },
                        { name: 'Orders', path: '/admin/orders' },
                        { name: 'Partners', path: '/admin/partners' },
                        { name: 'Doctors', path: '/admin/doctors' },
                        { name: 'Users', path: '/admin/users' },
                        { name: 'Appointments', path: '/admin/appointments' },
                    ].map((item) => (
                        <Link 
                            key={item.path}
                            to={item.path} 
                            onClick={() => setIsOpen(false)}
                            className={`block px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive(item.path)}`}
                        >
                            {item.name}
                        </Link>
                    ))}
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
        </>
    );
};

export default AdminSidebar;
