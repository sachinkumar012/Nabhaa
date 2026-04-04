import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FiShoppingBag, 
    FiClock, 
    FiCheckCircle, 
    FiXCircle, 
    FiTruck, 
    FiPackage,
    FiUser,
    FiMapPin,
    FiPhone,
    FiAlertCircle,
    FiSearch,
    FiArrowRight
} from 'react-icons/fi';
import PharmacistSidebar from '../../components/Pharmacist/PharmacistSidebar';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

export default function PharmacistOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const { pharmacist, pharmacistToken } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!pharmacistToken) return;
            try {
                const response = await axios.get('/api/orders/pharmacist', {
                    headers: { Authorization: `Bearer ${pharmacistToken}` }
                });
                setOrders(response.data);
            } catch (err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        // Socket setup
        const newSocket = io(window.location.origin || 'http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            if (pharmacist?._id) {
                newSocket.emit('join_pharmacist_room', pharmacist._id);
            }
        });

        newSocket.on('new_order', (order) => {
            setOrders(prev => [order, ...prev]);
            // Play notification sound
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log("Audio play failed", e));
        });

        return () => newSocket.close();
    }, [pharmacist?._id, pharmacistToken]);

    const updateStatus = async (orderId, status) => {
        try {
            const response = await axios.put(`/api/orders/${orderId}/status`, { status }, {
                headers: { Authorization: `Bearer ${pharmacistToken}` }
            });
            if (response.data) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
            }
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

    const statusTabs = [
        { name: 'All', icon: FiShoppingBag },
        { name: 'Pending', icon: FiClock },
        { name: 'Accepted', icon: FiCheckCircle },
        { name: 'Processing', icon: FiPackage },
        { name: 'Out for Delivery', icon: FiTruck },
        { name: 'Delivered', icon: FiCheckCircle },
        { name: 'Cancelled', icon: FiXCircle },
    ];

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <PharmacistSidebar />
            
            <main className="flex-grow p-8 lg:p-12">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Order Management</h1>
                    <p className="text-slate-500 font-medium">Manage incoming orders and track delivery status in real-time.</p>
                </header>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setFilter(tab.name)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-sm whitespace-nowrap
                                ${filter === tab.name 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 shadow-sm'
                                }
                            `}
                        >
                            <tab.icon size={18} />
                            {tab.name}
                            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full 
                                ${filter === tab.name ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}
                            `}>
                                {tab.name === 'All' ? orders.length : orders.filter(o => o.status === tab.name).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400 font-medium">Loading orders...</div>
                    ) : filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <OrderCard key={order._id} order={order} onUpdateStatus={updateStatus} />
                        ))
                    ) : (
                        <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiShoppingBag className="text-slate-200" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No orders found</h3>
                            <p className="text-slate-500">There are no orders with the status "{filter}" at the moment.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function OrderCard({ order, onUpdateStatus }) {
    const [expanded, setExpanded] = useState(false);

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return 'amber';
            case 'Accepted': return 'blue';
            case 'Processing': return 'indigo';
            case 'Packed': return 'purple';
            case 'Out for Delivery': return 'orange';
            case 'Delivered': return 'emerald';
            case 'Cancelled':
            case 'Rejected': return 'red';
            default: return 'slate';
        }
    };

    const color = getStatusColor(order.status);

    return (
        <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden
            ${order.status === 'Pending' ? 'ring-2 ring-amber-400/20' : ''}
        `}>
            {/* Header */}
            <div className={`px-8 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-50 bg-[#FBFBFF]`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center shadow-inner`}>
                        <FiShoppingBag size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-800">Order #{order._id.slice(-8).toUpperCase()}</h3>
                            {order.status === 'Pending' && <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>}
                        </div>
                        <p className="text-slate-400 text-xs font-medium">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Amount</p>
                        <p className="text-2xl font-black text-indigo-600 tracking-tight">₹{order.totalPrice}</p>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-100 hidden lg:block"></div>
                    <div className={`px-4 py-2 rounded-xl bg-${color}-50 border border-${color}-100 flex items-center gap-2`}>
                        <div className={`w-2 h-2 rounded-full bg-${color}-500 shadow-[0_0_8px] shadow-${color}-400`}></div>
                        <span className={`text-${color}-700 font-black text-xs uppercase tracking-widest`}>{order.status}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Patient Info */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Details</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                <FiUser size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700 text-sm">{order.user?.name || 'Walk-in Customer'}</p>
                                <div className="flex items-center gap-1 text-slate-400 text-xs">
                                    <FiPhone size={10} />
                                    <span>{order.user?.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mt-1">
                                <FiMapPin size={18} />
                            </div>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                            </p>
                        </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ordered Items ({order.orderItems.length})</h4>
                        <div className="space-y-3">
                            {order.orderItems.slice(0, 2).map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <div className="flex gap-2 items-center">
                                        <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black flex items-center justify-center">{item.qty}x</span>
                                        <span className="font-bold text-slate-700">{item.name}</span>
                                    </div>
                                    <span className="text-slate-400 font-medium whitespace-nowrap">₹{item.price * item.qty}</span>
                                </div>
                            ))}
                            {order.orderItems.length > 2 && (
                                <button onClick={() => setExpanded(!expanded)} className="text-indigo-600 text-xs font-bold hover:underline">
                                    + {order.orderItems.length - 2} more items
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-center gap-3">
                        {order.status === 'Pending' && (
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => onUpdateStatus(order._id, 'Accepted')}
                                    className="flex-grow py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    Accept Order <FiCheckCircle />
                                </button>
                                <button 
                                    onClick={() => onUpdateStatus(order._id, 'Rejected')}
                                    className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all text-sm border border-red-100 flex items-center justify-center"
                                >
                                    <FiXCircle />
                                </button>
                            </div>
                        )}
                        {order.status === 'Accepted' && (
                            <button 
                                onClick={() => onUpdateStatus(order._id, 'Processing')}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                Start Processing <FiPackage />
                            </button>
                        )}
                        {order.status === 'Processing' && (
                            <button 
                                onClick={() => onUpdateStatus(order._id, 'Packed')}
                                className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                Mark as Packed <FiCheckCircle />
                            </button>
                        )}
                        {order.status === 'Packed' && (
                            <button 
                                onClick={() => onUpdateStatus(order._id, 'Out for Delivery')}
                                className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                Hand over to Delivery <FiTruck />
                            </button>
                        )}
                        {order.status === 'Out for Delivery' && (
                            <button 
                                onClick={() => onUpdateStatus(order._id, 'Delivered')}
                                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                Confirm Delivery <FiClock />
                            </button>
                        )}
                        {(order.status === 'Delivered' || order.status === 'Cancelled' || order.status === 'Rejected') && (
                            <div className="text-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Workflow Completed</p>
                            </div>
                        )}
                    </div>
                </div>

                {expanded && (
                    <div className="mt-8 pt-8 border-t border-slate-50 animate-fadeIn">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">All Items</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {order.orderItems.map((item, i) => (
                                <div key={i} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex justify-between items-center">
                                    <div className="flex gap-2 items-center">
                                        <span className="w-5 h-5 bg-white text-indigo-600 rounded-md text-[10px] font-black flex items-center justify-center shadow-sm">{item.qty}x</span>
                                        <span className="font-bold text-slate-700 text-xs">{item.name}</span>
                                    </div>
                                    <span className="text-slate-400 font-bold text-xs whitespace-nowrap ml-2">₹{item.price * item.qty}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
