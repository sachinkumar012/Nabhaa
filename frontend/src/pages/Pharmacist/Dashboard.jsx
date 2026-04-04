import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
    FiShoppingBag, 
    FiUsers, 
    FiTrendingUp, 
    FiClock, 
    FiCheckCircle, 
    FiAlertCircle,
    FiArrowRight
} from 'react-icons/fi';
import PharmacistSidebar from '../../components/Pharmacist/PharmacistSidebar';

const StatusCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform`}></div>
        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className="text-slate-400 text-sm font-bold mb-1 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        <FiTrendingUp className="text-emerald-500" size={14} />
                        <span className="text-emerald-500 text-xs font-bold">{trend}% increase</span>
                    </div>
                )}
            </div>
            <div className={`w-14 h-14 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center shadow-inner`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

export default function PharmacistDashboard() {
    const { pharmacistToken } = useAuth();
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalSales: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!pharmacistToken) return;
            try {
                const config = {
                    headers: { Authorization: `Bearer ${pharmacistToken}` }
                };
                
                const response = await api.get('/pharmacist/analytics', config);
                if (response.data.success) {
                    setStats(response.data.analytics);
                }
                
                const ordersRes = await api.get('/orders/pharmacist', config);
                if (ordersRes.data) {
                    setRecentOrders(ordersRes.data.slice(0, 5));
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [pharmacistToken]);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <PharmacistSidebar />
            
            <main className="flex-grow p-8 lg:p-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Pharmacist Dashboard</h1>
                        <p className="text-slate-500 font-medium">Welcome back! Here's what's happening with your pharmacy today.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2 border border-slate-100 rounded-2xl shadow-sm">
                        <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all text-sm">
                            Add New Medicine
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatusCard title="Total Orders" value={stats.totalOrders} icon={FiShoppingBag} color="blue" trend={12} />
                    <StatusCard title="Pending" value={stats.pendingOrders} icon={FiClock} color="amber" />
                    <StatusCard title="Completed" value={stats.completedOrders} icon={FiCheckCircle} color="emerald" trend={8} />
                    <StatusCard title="Revenue" value={`₹${stats.totalSales.toLocaleString()}`} icon={FiTrendingUp} color="indigo" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Recent Orders Table */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <h2 className="text-xl font-bold text-slate-800">Recent Orders</h2>
                            <button className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1 group">
                                View All <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="overflow-x-auto flex-grow">
                            <table className="w-full text-left">
                                <thead className="bg-[#FBFCFD] text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-50">
                                    <tr>
                                        <th className="px-8 py-5">Order ID</th>
                                        <th className="px-6 py-5">Patient Name</th>
                                        <th className="px-6 py-5">Amount</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-8 py-5">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentOrders.length > 0 ? recentOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5 font-bold text-slate-600 text-sm">#{order._id.slice(-6).toUpperCase()}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-800 font-bold text-sm">{order.user?.name || 'Walk-in'}</span>
                                                    <span className="text-slate-400 text-xs">{order.user?.phone || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 font-black text-indigo-600 text-sm">₹{order.totalPrice}</td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                                    ${order.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                                                      order.status === 'Accepted' ? 'bg-blue-50 text-blue-600' :
                                                      order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 
                                                      'bg-slate-50 text-slate-600'}
                                                `}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <button className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium italic">
                                                No orders received yet. Stay tuned!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Stock Alert Section */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform"></div>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                                <FiAlertCircle className="text-amber-400" /> Stock Alerts
                            </h2>
                            <div className="space-y-5 relative z-10">
                                {[
                                    { name: 'Paracetamol 500mg', stock: 12, min: 20 },
                                    { name: 'Amoxicillin 250mg', stock: 5, min: 15 },
                                    { name: 'Vitamin C Syrup', stock: 8, min: 10 }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="flex justify-between font-bold text-sm">
                                            <span>{item.name}</span>
                                            <span className="text-amber-400">{item.stock} left</span>
                                        </div>
                                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-amber-400 h-full rounded-full transition-all duration-1000" 
                                                style={{ width: `${(item.stock / item.min) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-8 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-amber-400/20 active:scale-95 text-sm uppercase tracking-wide">
                                Refill Inventory
                            </button>
                        </div>
                        
                        {/* Analytics Preview */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
                                Sales Goal
                                <span className="text-xs font-bold text-slate-400">75% Achived</span>
                            </h2>
                            <div className="h-40 flex items-end gap-3 justify-between px-2">
                                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 flex-grow max-w-[15px]">
                                        <div 
                                            className="w-full bg-indigo-50 hover:bg-indigo-500 rounded-t-full transition-all duration-500" 
                                            style={{ height: `${h}%` }}
                                        ></div>
                                        <span className="text-[10px] font-bold text-slate-300">D{i+1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
