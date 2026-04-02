import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Clock, Package, Truck, XCircle,
  MapPin, CreditCard, ChevronRight, Loader2, AlertCircle, Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Status Config ────────────────────────────────────────────────────────── */
const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const STATUS_CONFIG = {
  Pending:    { color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-300', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  Processing: { color: 'text-blue-600',   bg: 'bg-blue-100',   border: 'border-blue-300',   badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  Confirmed:  { color: 'text-blue-600',   bg: 'bg-blue-100',   border: 'border-blue-300',   badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  Shipped:    { color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  Delivered:  { color: 'text-green-600',  bg: 'bg-green-100',  border: 'border-green-300',  badge: 'bg-green-100 text-green-700 border-green-200' },
  Cancelled:  { color: 'text-red-600',    bg: 'bg-red-100',    border: 'border-red-300',    badge: 'bg-red-100 text-red-700 border-red-200' },
};

const STEP_ICONS = {
  Pending:    <Clock size={16} />,
  Processing: <Package size={16} />,
  Shipped:    <Truck size={16} />,
  Delivered:  <CheckCircle size={16} />,
};

const formatDate = (ds) =>
  new Date(ds).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

/* ─── Main Component ──────────────────────────────────────────────────────── */
const OrderDetailPage = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/pharmacy'); return; }
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, { headers });
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <Loader2 size={36} className="animate-spin text-teal-400" />
          <p className="text-sm font-medium">Loading order details…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <AlertCircle size={48} className="text-red-400" />
          <h2 className="font-bold text-xl text-gray-800">Order Not Found</h2>
          <p className="text-gray-500 text-sm">{error || 'This order could not be loaded.'}</p>
          <button onClick={() => navigate('/orders')} className="bg-teal-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-600 transition-colors mt-2">
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const status = order.status || 'Pending';
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const orderItems = order.orderItems || order.items || [];
  const total = order.totalPrice || order.totalAmount || order.total || 0;
  const subtotal = order.itemsPrice || orderItems.reduce((s, i) => s + (i.price * (i.qty || i.quantity || 1)), 0);
  const shipping = order.shippingPrice || 0;
  const orderId = order._id || order.id;
  const createdAt = order.createdAt || order.orderDate;

  /* Current step index in the timeline */
  const currentStepIdx = STATUS_STEPS.indexOf(status);
  const isCancelled = status === 'Cancelled';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-teal-50 hover:text-teal-600 flex items-center justify-center transition-all"
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <h1 className="font-extrabold text-gray-900 text-xl">Order Details</h1>
            <nav className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Link to="/" className="hover:text-teal-600 transition-colors flex items-center gap-1"><Home size={11} /> Home</Link>
              <ChevronRight size={10} />
              <Link to="/orders" className="hover:text-teal-600 transition-colors">My Orders</Link>
              <ChevronRight size={10} />
              <span className="text-gray-600 font-medium">#{String(orderId).slice(-8).toUpperCase()}</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* ── Order Info Card ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Order ID</p>
              <p className="text-lg font-extrabold text-gray-900 font-mono">#{String(orderId).slice(-8).toUpperCase()}</p>
              {createdAt && <p className="text-xs text-gray-500 mt-0.5">{formatDate(createdAt)}</p>}
            </div>
            <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full border ${cfg.badge}`}>
              {status}
            </span>
          </div>
        </div>

        {/* ── Delivery Status Timeline ──────────────────────────────────── */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-5">Delivery Status</h2>
            <div className="flex items-start justify-between relative">
              {/* Progress line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-teal-500 z-0 transition-all duration-500"
                style={{ width: currentStepIdx < 0 ? '0%' : `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
              />

              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                      ${isCompleted ? 'bg-teal-500 text-white shadow-md shadow-teal-100' : 'bg-gray-200 text-gray-400'}
                      ${isCurrent ? 'ring-4 ring-teal-100 scale-110' : ''}`}
                    >
                      {STEP_ICONS[step]}
                    </div>
                    <p className={`text-[11px] font-bold text-center max-w-[60px] ${isCompleted ? 'text-teal-700' : 'text-gray-400'}`}>
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <XCircle size={22} className="text-red-500 shrink-0" />
            <div>
              <p className="font-bold text-red-700">Order Cancelled</p>
              <p className="text-xs text-red-500 mt-0.5">This order has been cancelled. Contact support for refund queries.</p>
            </div>
          </div>
        )}

        {/* ── Order Items ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-800">Order Items ({orderItems.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {orderItems.map((item, i) => {
              const itemName = item.name || item.productName || 'Medicine';
              const itemQty = item.qty || item.quantity || 1;
              const itemPrice = item.price || 0;
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    💊
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{itemName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {itemQty}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">₹{(itemPrice * itemQty).toFixed(0)}</p>
                    <p className="text-xs text-gray-400">₹{itemPrice}/unit</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Price Summary ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4">Price Breakdown</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">₹{Number(subtotal).toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charges</span>
              <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            {order.taxPrice > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Taxes</span>
                <span className="font-semibold">₹{Number(order.taxPrice).toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-gray-900 text-base border-t border-gray-100 pt-3 mt-2">
              <span>Total Paid</span>
              <span>₹{Number(total).toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* ── Payment + Address ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Payment */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={16} className="text-teal-600" />
              <h3 className="font-bold text-gray-800 text-sm">Payment</h3>
            </div>
            <p className="text-sm text-gray-700 font-semibold capitalize">{order.paymentMethod || 'Cash on Delivery'}</p>
            <span className={`inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {order.isPaid ? '✓ Paid' : 'Pending Payment'}
            </span>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-teal-600" />
                <h3 className="font-bold text-gray-800 text-sm">Delivery Address</h3>
              </div>
              <div className="text-sm text-gray-700 space-y-0.5">
                <p className="font-medium">{order.shippingAddress.address}</p>
                <p className="text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p className="text-gray-500">{order.shippingAddress.country}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-teal-300 text-gray-700 font-bold py-3 rounded-xl text-sm transition-colors"
          >
            <ArrowLeft size={15} /> Back to Orders
          </button>
          <button
            onClick={() => navigate('/pharmacy')}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-teal-100"
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailPage;
