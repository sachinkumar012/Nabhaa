import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { adminToken } = useAuth();
  
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white flex items-center px-4 z-40 shadow-md">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ml-4 font-bold text-lg">Nabha Admin</span>
      </div>

      <main className={`flex-1 p-4 md:p-8 transition-all duration-300 lg:ml-64 pt-20 lg:pt-8 w-full`}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
