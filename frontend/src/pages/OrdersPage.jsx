import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, ChevronRight, Clock, CheckCircle, Truck, XCircle,
  ArrowLeft, ShoppingBag, Loader2, AlertCircle, Home,
  ChevronDown, ChevronUp, MapPin, Receipt, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Status Config ────────────────────────────────────────────────────────── */
const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const STATUS_CONFIG = {
  Pending:    { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  Processing: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  Confirmed:  { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  Shipped:    { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  Delivered:  { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  Cancelled:  { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
};

const STEP_ICONS = {
  Pending:    <Clock size={16} />,
  Processing: <Package size={16} />,
  Shipped:    <Truck size={16} />,
  Delivered:  <CheckCircle size={16} />,
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

const formatDate = (ds) =>
  new Date(ds).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

const formatTime = (ds) => 
  new Date(ds).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

/* ─── Main Component ──────────────────────────────────────────────────────── */
const OrdersPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('All');
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    if (!user) { navigate('/pharmacy'); return; }
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/myorders?userId=${user._id || user.id}`,
          { headers }
        );
        if (!res.ok) throw new Error('Failed to load orders');
        const data = await res.json();
        const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
        setOrders(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, token, navigate]);

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const filteredOrders = orders.filter(o => {
    const s = o.status || 'Pending';
    if (activeTab === 'All') return true;
    if (activeTab === 'Delivered') return s === 'Delivered';
    if (activeTab === 'Cancelled') return s === 'Cancelled';
    if (activeTab === 'Pending') return ['Pending', 'Processing', 'Confirmed', 'Shipped'].includes(s);
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/pharmacy')}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-extrabold text-gray-900 text-2xl sm:text-3xl tracking-tight">My Orders</h1>
              <p className="text-sm text-gray-500 mt-1 hidden sm:block">Track, manage and view your past orders</p>
            </div>
          </div>
          {!loading && !error && (
            <div className="bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full font-bold text-sm border border-teal-100">
              {orders.length} Order{orders.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 sm:mt-8">
        
        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        {!loading && !error && orders.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {['All', 'Pending', 'Delivered', 'Cancelled'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* ── Loading & Error States ────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={40} className="animate-spin text-teal-500" />
            <p className="text-gray-500 font-medium">Loading your orders…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-red-100 mt-4">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Failed to load orders</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-teal-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-teal-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty State ───────────────────────────────────────────────── */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 mt-4 flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner ring-8 ring-gray-50/50">
              🛍️
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven't placed any orders. Start experiencing premium healthcare delivery today.</p>
            <Link
              to="/pharmacy"
              className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-800 transition-transform active:scale-95 shadow-lg"
            >
              <ShoppingBag size={18} /> Start Shopping
            </Link>
          </div>
        )}

        {/* ── Filtered Empty State ──────────────────────────────────────── */}
        {!loading && !error && orders.length > 0 && filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 mt-4">
            <Package size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No {activeTab.toLowerCase()} orders found.</p>
            <button 
              onClick={() => setActiveTab('All')}
              className="text-teal-600 font-bold text-sm mt-2 hover:underline"
            >
              View all orders
            </button>
          </div>
        )}

        {/* ── Orders List ───────────────────────────────────────────────── */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const orderId = order._id || order.id;
              const isExpanded = expandedOrders.has(orderId);
              const orderItems = order.orderItems || order.items || [];
              const total = order.totalPrice || order.totalAmount || order.total || 0;
              const subtotal = order.itemsPrice || orderItems.reduce((s, i) => s + (i.price * (i.qty || i.quantity || 1)), 0);
              const shipping = order.shippingPrice || 0;
              const tax = order.taxPrice || 0;
              const status = order.status || 'Pending';
              const isCancelled = status === 'Cancelled';
              const currentStepIdx = STATUS_STEPS.indexOf(status);
              const createdAt = order.createdAt || order.orderDate;

              return (
                <div
                  key={orderId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:scale-[1.005]"
                >
                  {/* ── Order Header Row ── */}
                  <div className="p-5 sm:p-6 border-b border-gray-100 bg-white flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Order ID</span>
                        <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded font-mono">
                          #{String(orderId).slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                        <Clock size={14} />
                        <span>{createdAt ? `${formatDate(createdAt)} at ${formatTime(createdAt)}` : 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                       <StatusBadge status={status} />
                       <div className="text-right">
                         <span className="text-xs text-gray-500 font-bold mr-1.5 uppercase tracking-wider hidden sm:inline-block">Total</span>
                         <span className="text-xl font-extrabold text-gray-900">₹{Number(total).toFixed(0)}</span>
                       </div>
                    </div>
                  </div>

                  {/* ── Product List Preview (Mini Cards) ── */}
                  <div className="p-5 sm:p-6 bg-slate-50/50">
                    <div className="space-y-3">
                      {(isExpanded ? orderItems : orderItems.slice(0, 2)).map((item, idx) => {
                        const itemName = item.name || item.productName || 'Medicine Item';
                        const itemQty = item.qty || item.quantity || 1;
                        const itemPrice = item.price || 0;
                        const itemImg = item.image;
                        return (
                          <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-gray-200 transition-colors">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                              {itemImg ? (
                                <img src={itemImg} alt={itemName} className="w-full h-full object-contain p-1" />
                              ) : (
                                <ImageIcon size={20} className="text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-800 text-sm sm:text-base truncate">{itemName}</h4>
                              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-medium">Qty: <span className="font-bold text-gray-700">{itemQty}</span></p>
                            </div>
                            <div className="text-right shrink-0 pl-4 border-l border-gray-100 h-10 flex items-center">
                              <p className="font-extrabold text-gray-900 text-sm sm:text-base">₹{(itemPrice * itemQty).toFixed(0)}</p>
                            </div>
                          </div>
                        );
                      })}

                      {!isExpanded && orderItems.length > 2 && (
                        <div className="text-center pt-2">
                          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full inline-flex items-center gap-1 border border-teal-100">
                            + {orderItems.length - 2} more item{orderItems.length - 2 > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Expanded Area ── */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-5 sm:p-6 bg-white space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                      
                      {/* Timeline */}
                      {!isCancelled ? (
                        <div className="mb-2">
                          <h4 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider flex items-center gap-2">
                            <Truck size={16} className="text-teal-600" /> Delivery Status
                          </h4>
                          <div className="relative mx-4 sm:mx-8">
                            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-100 rounded-full z-0" />
                            <div
                              className="absolute top-4 left-0 h-1 bg-teal-500 rounded-full z-0 transition-all duration-700 ease-out"
                              style={{ width: currentStepIdx < 0 ? '0%' : `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                            />
                            <div className="relative z-10 flex justify-between">
                              {STATUS_STEPS.map((step, idx) => {
                                const isCompleted = currentStepIdx >= idx;
                                const isCurrent = currentStepIdx === idx;
                                return (
                                  <div key={step} className="flex flex-col items-center gap-3">
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300
                                      ${isCompleted ? 'bg-teal-500 text-white shadow-md shadow-teal-200' : 'bg-white border-2 border-gray-200 text-gray-300'}
                                      ${isCurrent ? 'ring-4 ring-teal-50 scale-110' : ''}`}
                                    >
                                      {STEP_ICONS[step]}
                                    </div>
                                    <p className={`text-[10px] sm:text-xs font-bold text-center ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                      {step}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                         <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 mb-2">
                           <XCircle size={24} className="text-red-500 shrink-0" />
                           <div>
                             <p className="font-bold text-red-800">Order Cancelled</p>
                             <p className="text-xs text-red-600 mt-1 font-medium">This order was cancelled. No further tracking available.</p>
                           </div>
                         </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
                        {/* Address */}
                        {order.shippingAddress && (
                          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 h-full">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <MapPin size={16} className="text-gray-400" /> Shipping Details
                            </h4>
                            <p className="text-sm text-gray-800 font-bold mb-1">{order.shippingAddress.address}</p>
                            <p className="text-sm text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                            <p className="text-sm text-gray-500">{order.shippingAddress.country}</p>
                          </div>
                        )}

                        {/* Pricing Details */}
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 text-sm h-full flex flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Receipt size={16} className="text-gray-400" /> Payment Summary
                            </h4>
                            <div className="space-y-2.5">
                              <div className="flex justify-between text-gray-600">
                                <span className="font-medium">Subtotal</span>
                                <span className="font-bold text-gray-800">₹{Number(subtotal).toFixed(0)}</span>
                              </div>
                              <div className="flex justify-between text-gray-600">
                                <span className="font-medium">Delivery</span>
                                <span className={`font-bold ${shipping === 0 ? 'text-teal-600' : 'text-gray-800'}`}>
                                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                </span>
                              </div>
                              {tax > 0 && (
                                <div className="flex justify-between text-gray-600">
                                  <span className="font-medium">Taxes</span>
                                  <span className="font-bold text-gray-800">₹{Number(tax).toFixed(0)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                            <span className="font-extrabold text-gray-900 uppercase tracking-wider text-xs">Total Paid</span>
                            <span className="text-lg font-extrabold text-gray-900">₹{Number(total).toFixed(0)}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ── View Details Action ── */}
                  <div className="p-4 sm:p-5 bg-white border-t border-gray-50">
                    <button
                      onClick={() => toggleOrder(orderId)}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200
                        bg-gray-900 hover:bg-gray-800 text-white shadow-md shadow-gray-200/50 hover:shadow-lg active:scale-95"
                    >
                      {isExpanded ? (
                         <>Close Details <ChevronUp size={16} /></>
                      ) : (
                         <>View Order Details <ChevronDown size={16} className="animate-bounce" style={{animationDuration: '2s'}} /></>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default OrdersPage;
