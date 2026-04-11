import React, { useEffect, useState } from 'react';
import api from '../../utils/adminApi';
import { toast } from 'react-toastify';
import { ShoppingBag, Package, Truck, CheckCircle, Search, User, Store } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/admin/orders');
            setOrders(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch comprehensive orders');
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = 
            order._id.toLowerCase().includes(query) ||
            order.user?.name?.toLowerCase().includes(query) ||
            order.pharmacist?.pharmacyName?.toLowerCase().includes(query);
        const matchesFilter = filterStatus === 'All' || order.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status, isDelivered) => {
        if (isDelivered || status === 'Delivered') return 'bg-green-100 text-green-800';
        if (status === 'Cancelled' || status === 'Rejected') return 'bg-red-100 text-red-800';
        if (status === 'Out for Delivery') return 'bg-blue-100 text-blue-800';
        return 'bg-yellow-100 text-yellow-800';
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[70vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Platform Orders</h1>
                    <p className="text-gray-500 mt-1">Cross-platform monitoring of all transactions and fulfillments.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled/Rejected</option>
                    </select>

                    <div className="relative flex-grow sm:w-64 border border-gray-200 rounded-xl bg-white shadow-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search ID, User, Partner..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 border-t-0">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order Timeline</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stakeholders</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Financials</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                                <ShoppingBag size={20} />
                                            </div>
                                            <div className="ml-4 flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900 font-mono">
                                                    #{order._id.substring(order._id.length - 8).toUpperCase()}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                                <span className="text-xs text-indigo-500 font-bold tracking-wide mt-1">
                                                    {order.orderItems?.length || 0} ITEMS
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center text-sm font-medium text-gray-900">
                                                <User size={14} className="mr-2 text-indigo-400" />
                                                {order.user?.name || 'Guest User'}
                                            </div>
                                            <div className="flex items-center text-sm font-medium text-gray-600">
                                                <Store size={14} className="mr-2 text-pink-400" />
                                                {order.pharmacist?.pharmacyName || <span className="text-gray-400 italic">Unassigned</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900 mb-1">₹{order.totalPrice?.toFixed(2)}</div>
                                        <div className="text-xs font-semibold">
                                            {order.isPaid ? (
                                                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">Paid ✅</span>
                                            ) : (
                                                <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">Pending ⏳</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-bold rounded-full ${getStatusStyle(order.status, order.isDelivered)}`}>
                                            {order.isDelivered ? <CheckCircle size={14} /> : 
                                             order.status === 'Out for Delivery' ? <Truck size={14} /> :
                                             <Package size={14} />}
                                            {order.isDelivered ? 'Delivered' : order.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">
                                        No orders found tracking your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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

export default AdminOrders;
