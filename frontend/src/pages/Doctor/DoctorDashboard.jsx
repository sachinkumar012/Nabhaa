import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import socket from '../../utils/socket';
import { toast } from 'react-toastify';
import { 
    Users, Calendar, Clock, Video, TrendingUp,
    ArrowRight, Search, Bell, CheckCircle2, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [stats, setStats] = useState({ patientsTotal: 0, todayConsults: 0, upcomingCalls: 0, earnings: '₹0' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('doctorToken');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [profRes, aptRes, patientRes] = await Promise.all([
                    api.get('/doctors/profile', config),
                    api.get('/appointments/doctor/list', config),
                    api.get('/doctors/patients', config)
                ]);
                setProfile(profRes.data);
                const apts = aptRes.data.data || [];
                setAppointments(apts);
                setStats({
                    patientsTotal: patientRes.data.count || 0,
                    todayConsults: apts.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
                    upcomingCalls: apts.filter(a => a.status === 'scheduled' || a.status === 'waiting').length,
                    earnings: `₹${(apts.length * 500).toLocaleString()}`
                });
            } catch (error) {
                console.error(error);
                toast.error('Failed to load dashboard data');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!profile?._id) return;

        socket.emit('join_doctor_room', profile._id);

        // Incoming video call
        socket.on('incoming_call', (data) => {
            const notif = {
                id: Date.now(), type: 'call',
                message: `📹 Incoming call from ${data.patientName}`,
                time: new Date().toLocaleTimeString()
            };
            setNotifications(n => [notif, ...n]);
            toast.info(`Incoming Call from ${data.patientName}`, {
                position: 'top-center', autoClose: false,
                onClick: () => window.open(`/video-call/${data.callId}?type=doctor&name=${profile.name}`, '_blank')
            });
        });

        // New appointment booked for this doctor
        socket.on('appointment_booked', (data) => {
            const notif = {
                id: Date.now(), type: 'appointment',
                message: `📅 New appointment from ${data.patientName || 'a patient'}`,
                time: new Date().toLocaleTimeString()
            };
            setNotifications(n => [notif, ...n]);
            toast.success(`New appointment booked by ${data.patientName || 'a patient'}!`, { position: 'top-right' });
        });

        return () => {
            socket.off('incoming_call');
            socket.off('appointment_booked');
        };
    }, [profile]);

    if (!profile) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    // Strip "Dr." prefix to get real first name  e.g. "Dr. Harpreet Singh" → "Harpreet"
    const firstName = profile.name.replace(/^Dr\.?\s*/i, '').split(' ')[0];

    return (
        <div className="space-y-8 pb-10">
            {/* Top Bar */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome, Dr. {firstName} 👋</h1>
                    <p className="text-gray-500 flex items-center gap-2">
                        <Calendar size={16} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifs(v => !v)}
                            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 hover:text-blue-600 transition-colors relative"
                        >
                            <Bell size={20} />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                    {notifications.length > 9 ? '9+' : notifications.length}
                                </span>
                            )}
                        </button>
                        {showNotifs && (
                            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                                    <p className="font-bold text-gray-800 text-sm">Notifications</p>
                                    <button onClick={() => { setNotifications([]); setShowNotifs(false); }}
                                        className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                                        Clear all
                                    </button>
                                </div>
                                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                                    {notifications.length === 0 ? (
                                        <p className="text-center text-gray-400 text-sm py-8">No new notifications</p>
                                    ) : notifications.map(n => (
                                        <div key={n.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                            <p className="text-sm text-gray-800">{n.message}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link to="/doctor/profile" className="flex items-center gap-3 bg-white p-1 pr-4 rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                        <img className="h-9 w-9 rounded-full object-cover bg-blue-100"
                            src={profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0369a1&color=fff`}
                            alt="profile" />
                        <span className="text-sm font-semibold text-gray-700">{profile.name}</span>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} color="blue" label="Total Patients" value={stats.patientsTotal} trend="+12" />
                <StatCard icon={Calendar} color="purple" label="Today's Consults" value={stats.todayConsults} trend="0" />
                <StatCard icon={Video} color="green" label="Video Calls" value={stats.upcomingCalls} trend="Upcoming" />
                <StatCard icon={TrendingUp} color="orange" label="Monthly Earnings" value={stats.earnings} trend="+5.4%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Appointments List */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Upcoming Schedule</h2>
                        <Link to="/doctor/appointments" className="text-blue-600 text-sm font-semibold hover:underline">View All</Link>
                    </div>
                    <div className="divide-y divide-gray-50 overflow-y-auto max-h-[500px]">
                        {appointments.length > 0 ? appointments.slice(0, 5).map((apt) => (
                            <div key={apt._id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg
                                        ${apt.type === 'instant' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {(apt.patientName || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{apt.patientName}</h4>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <Clock size={14} /> {apt.time} • {apt.type === 'instant' ? 'Video' : 'Clinic'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                        ${apt.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                          apt.status === 'waiting' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {apt.status}
                                    </span>
                                    {apt.videoCallId && (
                                        <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer"
                                            className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-100">
                                            <Video size={18} />
                                        </a>
                                    )}
                                    <Link to={`/doctor/patients/${apt.patientEmail}/history`}
                                        className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </div>
                        )) : (
                            <div className="p-10 text-center text-gray-500">No appointments scheduled today.</div>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Hospital Status</h3>
                            <div className="flex items-center gap-2 text-blue-100 mb-4">
                                <CheckCircle2 size={16} /> <span>System Online</span>
                            </div>
                            <p className="text-sm text-blue-100 mb-6 font-light leading-relaxed">
                                {notifications.length > 0
                                    ? `You have ${notifications.length} new notification${notifications.length > 1 ? 's' : ''} waiting.`
                                    : 'All systems operational. No pending alerts.'}
                            </p>
                            <Link to="/doctor/appointments" className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors">
                                Review Records <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">Quick Patient Search</h3>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" placeholder="Patient name or ID..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                onKeyDown={e => { if(e.key === 'Enter') window.location.href = '/doctor/patients'; }}
                            />
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Quick Links</p>
                            <div className="flex flex-wrap gap-2">
                                {['My Patients', 'Prescriptions', 'Appointments'].map(name => (
                                    <Link key={name} to={`/doctor/${name.toLowerCase().replace(' ', '')}`}
                                        className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        {name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, color, label, value, trend }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
    };
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:border-blue-100 transition-all group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${colors[color]}`}>
                <Icon size={28} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-400 mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                    {trend && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{trend}</span>}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
