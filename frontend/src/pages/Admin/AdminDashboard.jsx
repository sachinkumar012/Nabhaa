import React, { useEffect, useState } from 'react';
import api from '../../utils/adminApi';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { Users, Store, ShoppingBag, Stethoscope, IndianRupee, TrendingUp, TrendingDown, Activity, Bell } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/dashboard');
            setStats(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch dashboard stats');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        // Socket setup for global monitoring
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

        socket.on('admin_new_order', (data) => {
            toast.success(`New Platform Order: ₹${data.order.totalPrice}`, {
                icon: <Bell className="text-indigo-600" />,
                onClick: () => window.location.href = '/admin/orders'
            });
            fetchStats(); // Refresh charts and counts
        });

        return () => socket.close();
    }, []);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading || !stats) return (
        <div className="flex justify-center flex-col gap-4 text-indigo-600 items-center h-[70vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-current"></div>
            <p className="font-semibold animate-pulse">Aggregating Global Metrics...</p>
        </div>
    );

    const StatCard = ({ title, value, icon, gradient, amount = false }) => (
        <div className={`rounded-3xl p-6 text-white shadow-lg relative overflow-hidden bg-gradient-to-br ${gradient}`}>
            <div className="absolute top-0 right-0 p-4 opacity-20">
                {icon}
            </div>
            <p className="text-white/80 font-semibold mb-2">{title}</p>
            <h3 className="text-3xl font-extrabold flex items-center">
                {amount && <IndianRupee size={24} className="mr-1" />}
                {value}
            </h3>
        </div>
    );

    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Control Center</h1>
                    <p className="text-gray-500 mt-1">Live overview of platform growth and economics.</p>
                </div>
            </div>

            {/* Top Economic Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Revenue (All Time)" 
                    value={stats.revenue?.total?.toLocaleString()} 
                    amount={true}
                    icon={<IndianRupee size={80} />} 
                    gradient="from-emerald-500 to-green-700" 
                />
                <StatCard 
                    title="Monthly Revenue" 
                    value={stats.revenue?.monthly?.toLocaleString()} 
                    amount={true}
                    icon={<TrendingUp size={80} />} 
                    gradient="from-blue-500 to-indigo-700" 
                />
                <StatCard 
                    title="Active Partners" 
                    value={stats.activePartners} 
                    icon={<Store size={80} />} 
                    gradient="from-purple-500 to-pink-700" 
                />
                <StatCard 
                    title="Total Patients" 
                    value={stats.users} 
                    icon={<Users size={80} />} 
                    gradient="from-amber-400 to-orange-600" 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                
                {/* Main Trend Line */}
                <div className="xl:col-span-2 bg-white p-6 rounded-3xl shadow-soft-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Activity className="text-indigo-600" size={20} />
                        7-Day Order Volume Trends
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.charts?.dailyTrends || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ stroke: '#E5E7EB', strokeWidth: 2 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="orders" 
                                    stroke="#6366f1" 
                                    strokeWidth={4}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#6366f1' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Distribution */}
                <div className="bg-white p-6 rounded-3xl shadow-soft-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-6">Payment Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.charts?.paymentDistribution?.length ? stats.charts.paymentDistribution : [{_id: 'Standard', count: 1}]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {(stats.charts?.paymentDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2 flex-wrap">
                        {stats.charts?.paymentDistribution?.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                {entry._id || 'Unknown'}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Secondary System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Daily Revenue</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">₹{stats.revenue?.daily?.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <TrendingUp size={24} />
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Platform Doctors</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.doctors}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <Stethoscope size={24} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Orders Fulfilled</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.orders}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                        <ShoppingBag size={24} />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
