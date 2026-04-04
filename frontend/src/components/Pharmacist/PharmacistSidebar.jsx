import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    FiGrid, 
    FiShoppingBag, 
    FiPackage, 
    FiActivity, 
    FiPieChart, 
    FiUser, 
    FiLogOut, 
    FiBell,
    FiSettings
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
    { name: 'Dashboard', icon: FiGrid, path: '/pharmacist/dashboard' },
    { name: 'Orders', icon: FiShoppingBag, path: '/pharmacist/orders' },
    { name: 'Medicines', icon: FiPackage, path: '/pharmacist/medicines' },
    { name: 'Lab Tests', icon: FiActivity, path: '/pharmacist/lab-tests' },
    { name: 'Analytics', icon: FiPieChart, path: '/pharmacist/analytics' },
    { name: 'Profile', icon: FiUser, path: '/pharmacist/profile' },
];

export default function PharmacistSidebar() {
    const { logoutPharmacist, pharmacist } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutPharmacist();
        navigate('/pharmacist/login');
    };

    return (
        <aside className="w-64 bg-white h-screen sticky top-0 border-r border-slate-100 flex flex-col shadow-sm">
            {/* Logo */}
            <div className="p-8 border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <FiPackage size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 leading-tight">Nabhaa</h2>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-500">Pharmacist</span>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-grow p-4 space-y-2 mt-4 px-6">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all group
                            ${isActive 
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                            }
                        `}
                    >
                        <item.icon size={20} className="transition-transform group-hover:scale-110" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Info / Logout */}
            <div className="p-6 mt-auto border-t border-slate-50">
                <div className="bg-slate-50 p-4 rounded-2xl mb-4 flex items-center gap-3">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${pharmacist?.name || 'Pharmacist'}&background=6366f1&color=fff&bold=true`} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-xl shadow-md"
                    />
                    <div className="overflow-hidden">
                        <p className="font-bold text-slate-700 truncate text-sm">{pharmacist?.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{pharmacist?.email}</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-bold transition-all group"
                >
                    <FiLogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
