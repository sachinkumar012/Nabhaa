import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    FiPieChart, 
    FiTrendingUp, 
    FiDollarSign, 
    FiShoppingBag, 
    FiUsers,
    FiCalendar,
    FiArrowUpRight,
    FiArrowDownRight,
    FiActivity,
    FiPackage,
    FiInfo
} from 'react-icons/fi';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line
} from 'recharts';
import PharmacistSidebar from '../../components/Pharmacist/PharmacistSidebar';
import { useAuth } from '../../context/AuthContext';

/* ── HELPERS ────────────────────────────────────────────────────────────── */
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 animate-in fade-in zoom-in duration-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-bold">₹{payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

/* ── COMPONENTS ─────────────────────────────────────────────────────────── */

const StatCard = ({ title, value, growth, icon: Icon, color, trendData }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 group">
        <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {growth >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
                {Math.abs(growth)}%
            </div>
        </div>
        <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">₹{value.toLocaleString()}</h3>
        </div>
        {/* Sparkline */}
        <div className="h-12 mt-4 opacity-40 group-hover:opacity-100 transition-opacity overflow-hidden">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <AreaChart data={trendData}>
                    <Area type="monotone" dataKey="rev" stroke={growth >= 0 ? '#10B981' : '#EF4444'} fill={growth >= 0 ? '#10B98120' : '#EF444420'} strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default function PharmacistAnalytics() {
    const { pharmacistToken } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30D'); // 7D, 30D, 90D

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!pharmacistToken) return;
            setLoading(true);
            try {
                const response = await axios.get('/api/pharmacist/analytics', {
                    headers: { Authorization: `Bearer ${pharmacistToken}` }
                });
                setData(response.data.analytics);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [pharmacistToken]);

    const chartData = useMemo(() => {
        if (!data?.trends?.daily) return [];
        const days = timeRange === '7D' ? 7 : timeRange === '30D' ? 30 : 90;
        return data.trends.daily.slice(-days).map(d => ({
            name: new Date(d._id).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            revenue: d.revenue,
            orders: d.orders
        }));
    }, [data, timeRange]);

    const insight = useMemo(() => {
        if (!data) return "Loading insights...";
        const topMed = data.topMedicines?.[0]?.name || "N/A";
        const growth = data.revenueOverview?.weekly?.growth || 0;
        if (growth > 0) return `Revenue is up ${growth}% this week! Your best-seller is ${topMed}.`;
        return `Focus on promoting ${topMed} to boost your weekly sales goal.`;
    }, [data]);

    if (loading && !data) {
        return (
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <PharmacistSidebar />
                <main className="flex-grow p-12 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-bold text-sm">Processing Analytics...</p>
                    </div>
                </main>
            </div>
        );
    }

    const { revenueOverview, orderStats, topMedicines, labStats } = data || {};

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <PharmacistSidebar />
            
            <main className="flex-grow p-8 lg:p-12">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Analytics Dashboard</h1>
                        <p className="text-slate-500 font-medium">Real-time revenue tracking and performance insights.</p>
                    </div>
                    <div className="bg-white p-1.5 rounded-2xl border border-slate-100 flex gap-1 shadow-sm">
                        {['7D', '30D', '90D'].map(t => (
                            <button 
                                key={t} 
                                onClick={() => setTimeRange(t)}
                                className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${timeRange === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </header>

                {/* 1. Revenue Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard 
                        title="Daily Revenue" 
                        value={revenueOverview?.daily?.value || 0} 
                        growth={revenueOverview?.daily?.growth || 0} 
                        icon={FiDollarSign} 
                        color="indigo" 
                        trendData={chartData.slice(-7).map(d => ({ rev: d.revenue }))}
                    />
                    <StatCard 
                        title="Weekly Revenue" 
                        value={revenueOverview?.weekly?.value || 0} 
                        growth={revenueOverview?.weekly?.growth || 0} 
                        icon={FiActivity} 
                        color="emerald" 
                        trendData={chartData.slice(-14).map(d => ({ rev: d.revenue }))}
                    />
                    <StatCard 
                        title="Monthly Revenue" 
                        value={revenueOverview?.monthly?.value || 0} 
                        growth={revenueOverview?.monthly?.growth || 0} 
                        icon={FiTrendingUp} 
                        color="blue" 
                        trendData={chartData.map(d => ({ rev: d.revenue }))}
                    />
                    <StatCard 
                        title="Yearly Revenue" 
                        value={revenueOverview?.yearly?.value || 0} 
                        growth={revenueOverview?.yearly?.growth || 0} 
                        icon={FiCalendar} 
                        color="purple" 
                        trendData={chartData.map(d => ({ rev: d.revenue }))}
                    />
                </div>

                {/* 2. Main Revenue Trend Chart */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm mb-10 overflow-hidden relative">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 capitalize tracking-tight">Revenue Trend</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Earnings vs Orders over time</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
                                <span className="text-xs font-bold text-slate-500">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
                                <span className="text-xs font-bold text-slate-500">Orders</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%" debounce={100}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#4F46E5" 
                                    strokeWidth={6} 
                                    fillOpacity={1} 
                                    fill="url(#colorRev)" 
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 3. Order Distribution */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 self-start tracking-tight">Order Status</h3>
                        <div className="h-64 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={256} debounce={100}>
                                <PieChart>
                                    <Pie
                                        data={orderStats || []}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationDuration={1000}
                                    >
                                        {orderStats?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                            {orderStats?.map((entry, index) => (
                                <div key={index} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-[10px] font-bold text-slate-400 capitalize">{entry.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-700 ml-4">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Top Selling Medicines */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm lg:col-span-2">
                        <h3 className="text-lg font-bold text-slate-800 mb-8 tracking-tight">Top Selling Medicines</h3>
                        <div className="h-80 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%" debounce={100}>
                                <BarChart layout="vertical" data={topMedicines || []} margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#475569', fontSize: 10, fontWeight: 700}}
                                        width={100}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Bar 
                                        dataKey="revenue" 
                                        fill="#4F46E5" 
                                        radius={[0, 10, 10, 0]} 
                                        barSize={20}
                                        animationDuration={1500}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 5. Smart Insights & Lab Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Lab Test Stats */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-indigo-50/50">
                            <FiActivity size={80} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-6 tracking-tight relative z-10">Lab Test Performance</h3>
                        <div className="space-y-6 relative z-10">
                            {labStats?.map((lab, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{lab.name}</span>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{lab.bookings} Bookings</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-800">₹{lab.revenue.toLocaleString()}</span>
                                </div>
                            ))}
                            {(!labStats || labStats.length === 0) && <p className="text-slate-400 italic text-sm py-4">No lab bookings found.</p>}
                        </div>
                    </div>

                    {/* Insights Box */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl"></div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <FiInfo size={16} />
                            </div>
                            <h3 className="text-lg font-bold tracking-tight">Smart Business Insights</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                    {insight}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-emerald-400">Peak Sales</p>
                                    <p className="text-xs font-bold text-white">Mon - Wed</p>
                                </div>
                                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-blue-400">Top Service</p>
                                    <p className="text-xs font-bold text-white">Lab Testing</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
