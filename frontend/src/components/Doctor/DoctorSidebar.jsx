import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    Video, 
    FileText, 
    UserCircle,
    LogOut,
    Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DoctorSidebar = () => {
    const { logoutDoctor } = useAuth();
    const navigate = useNavigate();
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
        { name: 'Patients', icon: Users, path: '/doctor/patients' },
        { name: 'Appointments', icon: Calendar, path: '/doctor/appointments' },
        { name: 'Video Consult', icon: Video, path: '/doctor/video-consult' },
        { name: 'Prescriptions', icon: FileText, path: '/doctor/prescriptions' },
        { name: 'Profile', icon: UserCircle, path: '/doctor/profile' },
    ];

    const handleLogout = () => {
        logoutDoctor();
        navigate('/doctor/login');
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 overflow-y-auto">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <Stethoscope className="text-white" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Nabha</h2>
                    <p className="text-xs text-blue-600 font-medium tracking-wider uppercase">Doctor Portal</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                            ${isActive 
                                ? 'bg-blue-50 text-blue-600 shadow-sm font-semibold' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                        `}
                    >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default DoctorSidebar;
