import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Calendar, Video, FileText,
    UserCircle, LogOut, Stethoscope, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import socket from '../../utils/socket';
import { toast } from 'react-toastify';

const DoctorSidebar = () => {
    const { logoutDoctor, doctor, doctorToken } = useAuth();
    const navigate = useNavigate();
    const [incomingCall, setIncomingCall] = useState(null);

    // Listen for incoming video calls directed to this doctor
    useEffect(() => {
        if (!doctor?._id) return;
        socket.emit('join_doctor_room', doctor._id);

        const handleCall = (data) => {
            setIncomingCall(data);
            toast.info(
                <div>
                    <p className="font-bold">📹 Incoming Call</p>
                    <p className="text-sm">From: {data.patientName}</p>
                    <button
                        onClick={() => {
                            window.open(`/video-call/${data.callId}?type=doctor&name=${encodeURIComponent(doctor.name || 'Doctor')}`, '_blank');
                            setIncomingCall(null);
                        }}
                        className="mt-2 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                        Join Call
                    </button>
                </div>,
                { autoClose: 30000, position: 'top-center' }
            );
        };

        socket.on('incoming_call', handleCall);
        return () => socket.off('incoming_call', handleCall);
    }, [doctor]);

    const navItems = [
        { name: 'Dashboard',     icon: LayoutDashboard, path: '/doctor/dashboard' },
        { name: 'Patients',      icon: Users,           path: '/doctor/patients' },
        { name: 'Appointments',  icon: Calendar,        path: '/doctor/appointments' },
        { name: 'Prescriptions', icon: FileText,        path: '/doctor/prescriptions' },
        { name: 'Profile',       icon: UserCircle,      path: '/doctor/profile' },
    ];

    const handleLogout = () => {
        logoutDoctor();
        navigate('/doctor/login');
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 shadow-sm z-40">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-md">
                    <Stethoscope className="text-white" size={22} />
                </div>
                <div>
                    <h2 className="text-lg font-extrabold text-gray-900 leading-none">Nabhaa</h2>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Doctor Portal</p>
                </div>
            </div>

            {/* Doctor Info */}
            {doctor && (
                <div className="px-4 py-3 mx-3 mt-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-gray-800 truncate">{doctor.name}</p>
                    <p className="text-[10px] text-blue-600 truncate">{doctor.email}</p>
                </div>
            )}

            {/* Incoming call banner */}
            {incomingCall && (
                <div className="mx-3 mt-3 bg-green-500 text-white rounded-xl p-3 animate-pulse">
                    <p className="text-xs font-bold flex items-center gap-1"><Video size={14} /> Incoming Call!</p>
                    <p className="text-[11px] opacity-90">{incomingCall.patientName}</p>
                    <button
                        onClick={() => {
                            window.open(`/video-call/${incomingCall.callId}?type=doctor&name=${encodeURIComponent(doctor?.name || 'Doctor')}`, '_blank');
                            setIncomingCall(null);
                        }}
                        className="mt-1.5 w-full bg-white text-green-700 text-xs py-1.5 rounded-lg font-bold hover:bg-green-50 transition"
                    >
                        Join Now
                    </button>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-0.5 mt-4 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-sm font-medium
                             ${isActive
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold shadow-sm border border-blue-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`
                        }
                    >
                        <item.icon size={18} />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all text-sm font-medium"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default DoctorSidebar;
