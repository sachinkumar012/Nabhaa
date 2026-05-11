import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, ArrowLeft, ChevronRight, Truck, Tag,
  Home, Package, Loader2, ShoppingBag, FlaskConical, Minus, Plus, AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const getMedIcon = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('syrup') || t.includes('liquid')) return '🍶';
  if (t.includes('injection') || t.includes('inj')) return '💉';
  if (t.includes('drop')) return '💧';
  if (t.includes('cream') || t.includes('gel') || t.includes('oint')) return '🧴';
  if (t.includes('capsule') || t.includes('cap')) return '🟢';
  if (t.includes('vitamin') || t.includes('supplement')) return '🌟';
  return '💊';
};

const CartPage = () => {
  const { cart, removeFromCart, updateQty, clearCart, cartTotal, cartCount } = useCart();
  const { user, setAuthModalOpen } = useAuth();
  const navigate = useNavigate();
  const [removingId, setRemovingId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount }
  const [couponError, setCouponError] = useState('');

  const deliveryCharge = cartTotal >= 299 ? 0 : (cart.length > 0 ? 50 : 0);
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, cartTotal + deliveryCharge - discount);

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).toUpperCase().trim();
    setCouponError('');

    if (!code) {
      const msg = 'Please enter a coupon code';
      setCouponError(msg);
      toast.error(msg);
      return;
    }

    if (code === 'FIRST100') {
      if (cartTotal <= 299) {
        const msg = 'Order above ₹299 to use this coupon';
        setCouponError(msg);
        toast.warning(msg);
        return;
      }
      setAppliedCoupon({ code: 'FIRST100', discount: 100 });
      setCouponCode('');
      setCouponError('');
      toast.success('Coupon applied successfully!');
    } else {
      const msg = 'Invalid coupon code';
      setCouponError(msg);
      toast.error(msg);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Coupon removed');
  };

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    setTimeout(() => {
      removeFromCart(productId);
      setRemovingId(null);
    }, 250);
  };

  const handleCheckout = () => {
    if (!user) { setAuthModalOpen(true); return; }
    if (cart.length === 0) return;
    sessionStorage.setItem('nabha_open_checkout', '1');
    navigate('/pharmacy', { state: { openCheckout: true } });
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-[1200px] mx-auto flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="flex items-center gap-1.5 hover:text-teal-600 font-medium transition-colors"><Home size={14} /> Home</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <Link to="/pharmacy" className="hover:text-teal-600 font-medium transition-colors">Pharmacy</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-800 font-semibold">Cart</span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-teal-500 hover:text-teal-600 hover:shadow-md transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-extrabold text-2xl md:text-3xl text-gray-900 tracking-tight">
              Your Cart {cartCount > 0 && <span className="text-lg text-gray-500 font-medium ml-2 bg-gray-100 px-3 py-1 rounded-full">{cartCount} items</span>}
            </h1>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => { if (window.confirm('Clear entire cart?')) clearCart(); }}
              className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 font-semibold transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={16} /> Clear Cart
            </button>
          )}
        </div>

        {/* ── Empty State ─────────────────────────────────────────────── */}
        {cart.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-40 h-40 bg-teal-50 rounded-full flex items-center justify-center text-8xl mb-8 shadow-inner shadow-teal-100/50">
              🛒
            </div>
            <h2 className="font-extrabold text-gray-900 text-3xl mb-3">Your cart is empty</h2>
            <p className="text-gray-500 text-lg mb-8 max-w-md">Looks like you haven't added any medicines to your cart yet.</p>
            <Link
              to="/pharmacy"
              className="flex items-center gap-2 bg-teal-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-teal-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-600/30 transition-all duration-200"
            >
              <ShoppingBag size={20} /> Browse Medicines
            </Link>
          </div>
        )}

        {/* ── Cart Content ─────────────────────────────────────────────── */}
        {cart.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* ── Items List Area ──────────────────────────────────────────── */}
            <div className="w-full lg:flex-1 space-y-6">
              
              {/* Modern Free Delivery Progress Bar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
                {cartTotal < 299 ? (
                  <div className="pl-3">
                    <div className="flex items-center gap-2 text-gray-800 text-base font-semibold mb-3">
                      <div className="bg-teal-50 text-teal-600 p-1.5 rounded-full"><Truck size={18} /></div>
                      Add <span className="text-teal-600 font-extrabold text-lg">₹{Math.ceil(299 - cartTotal)}</span> more for FREE delivery
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-700 ease-out relative"
                        style={{ width: `${Math.min((cartTotal / 299) * 100, 100)}%` }}
                      >
                         <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pl-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 text-green-600 p-2 rounded-full"><Truck size={20} /></div>
                      <span className="text-green-700 text-lg font-bold">🎉 You qualify for FREE delivery!</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-4 pt-2">
                {cart.map(item => {
                  const mrp = item.oldPrice || Math.round(item.price * 1.15); // Simulated MRP for UI
                  const discountPercent = Math.round(((mrp - item.price) / mrp) * 100);

                  return (
                    <div
                      key={item.productId}
                      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row gap-5 transition-all duration-300 hover:shadow-md hover:-translate-y-[2px]
                        ${removingId === item.productId ? 'opacity-0 scale-95' : 'opacity-100'}`}
                    >
                      {/* Left: Image / Icon Container */}
                      <div className="w-full sm:w-28 h-28 bg-gray-50 rounded-xl flex items-center justify-center text-5xl shrink-0 border border-gray-100">
                        {getMedIcon(item.type)}
                      </div>

                      {/* Center: Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1 min-w-0 pr-4">
                               <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 truncate">{item.name}</h3>
                               <p className="text-sm text-gray-500 font-medium">{item.packSize || item.type}</p>
                            </div>
                            
                            <button
                              onClick={() => handleRemove(item.productId)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors shrink-0"
                              title="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          
                          {item.source === 'prescription' && (
                            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md border border-purple-100">
                              <FlaskConical size={12} /> Requires Prescription
                            </div>
                          )}
                        </div>
                        
                         <div className="flex flex-wrap gap-4 items-end justify-between mt-4">
                           {/* Price Section */}
                           <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xl font-extrabold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</span>
                                {item.quantity === 1 && discountPercent > 0 && (
                                   <span className="text-sm text-gray-400 line-through font-medium">₹{mrp}</span>
                                )}
                                {item.quantity === 1 && discountPercent > 0 && (
                                   <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase tracking-wider">{discountPercent}% OFF</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 font-medium">
                                ₹{item.price} / unit
                              </div>
                           </div>

                           {/* Quantity Controls - Modern Pill Style */}
                           <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm">
                              <button
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                                onClick={() => updateQty(item.productId, item.quantity - 1)}
                              >
                                {item.quantity === 1 ? <Trash2 size={14} className="text-red-400" /> : <Minus size={16} />}
                              </button>
                              <span className="w-8 text-center font-bold text-gray-900 text-sm select-none">
                                {item.quantity}
                              </span>
                              <button
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                                onClick={() => updateQty(item.productId, item.quantity + 1)}
                              >
                                <Plus size={16} />
                              </button>
                           </div>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="pt-2 md:hidden">
                 <button
                    onClick={() => { if (window.confirm('Clear entire cart?')) clearCart(); }}
                    className="flex w-full justify-center items-center gap-2 text-sm text-red-500 font-semibold py-3 bg-red-50 rounded-xl transition-colors hover:bg-red-100"
                  >
                    <Trash2 size={16} /> Clear Cart
                 </button>
              </div>

               <Link
                  to="/pharmacy"
                  className="hidden md:inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold transition-colors mt-2 p-2"
                >
                  <ArrowLeft size={16} /> Continue Shopping
                </Link>
            </div>

            {/* ── Order Summary Card (Sticky) ─────────────────────────────────────── */}
            <div className="w-full lg:w-[380px] shrink-0 sticky top-24 space-y-6">
              
              {/* Coupon Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="bg-teal-50 p-2 rounded-lg text-teal-600 shadow-sm border border-teal-100 shrink-0">
                     <Tag size={20} />
                   </div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900 text-sm">Apply Coupon</h4>
                     <p className="text-xs text-gray-500">
                       {user ? 'Save more on your order' : 'Log in to view available offers'}
                     </p>
                   </div>
                 </div>

                 {!appliedCoupon ? (
                   <div className="space-y-3">
                     <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={couponCode}
                         onChange={(e) => setCouponCode(e.target.value)}
                         placeholder="Enter Code"
                         className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-teal-500 uppercase"
                       />
                       <button 
                         onClick={() => handleApplyCoupon()}
                         className="bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-teal-700 transition-colors"
                       >
                         Apply
                       </button>
                     </div>
                     {couponError && <p className="text-xs text-red-500 font-bold ml-1">{couponError}</p>}
                     
                     {/* Recommended Coupon */}
                     <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center justify-between group transition-all hover:border-orange-200">
                       <div>
                         <div className="flex items-center gap-2">
                           <span className="font-black text-orange-700 text-sm tracking-wider">FIRST100</span>
                           <span className="bg-orange-200 text-orange-800 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">Recommended</span>
                         </div>
                         <p className="text-[10px] text-orange-600 font-bold mt-0.5">₹100 OFF on orders above ₹299</p>
                       </div>
                       <button 
                         onClick={() => handleApplyCoupon('FIRST100')}
                         className="text-orange-700 font-black text-xs hover:underline"
                       >
                         APPLY
                       </button>
                     </div>
                   </div>
                 ) : (
                   <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-700">
                          <Tag size={12} />
                         </div>
                        <div>
                          <p className="text-xs font-black text-green-800 tracking-wide uppercase">{appliedCoupon.code} Applied</p>
                          <p className="text-[10px] text-green-600 font-bold">You saved ₹{appliedCoupon.discount}</p>
                        </div>
                      </div>
                      <button onClick={removeCoupon} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                   </div>
                 )}
              </div>

              {/* Summary Details */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/40 p-6">
                <h2 className="font-extrabold text-gray-900 text-lg mb-5 pb-4 border-b border-gray-100">Price Details</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-gray-600 text-sm">
                    <span className="font-medium">Subtotal ({cartCount} item{cartCount > 1 ? 's' : ''})</span>
                    <span className="font-bold text-gray-900 text-base">₹{cartTotal.toFixed(0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-gray-600 text-sm">
                    <span className="font-medium flex items-center gap-1.5">
                       Delivery Charge
                       <div className="group relative hidden sm:block">
                          <AlertCircle size={14} className="text-gray-400" />
                          <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10 text-center">
                            Free delivery on orders above ₹299
                          </div>
                       </div>
                    </span>
                    <span className={`font-bold ${deliveryCharge === 0 ? 'text-green-600' : 'text-gray-900 text-base'}`}>
                      {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-green-600 text-sm animate-in slide-in-from-top-1 duration-200">
                      <span className="font-medium flex items-center gap-1.5">
                        Coupon Discount ({appliedCoupon.code})
                      </span>
                      <span className="font-bold">-₹{appliedCoupon.discount}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-dashed border-gray-200">
                    <div className="flex justify-between items-center">
                       <span className="font-bold text-gray-900 text-lg">Total Amount</span>
                       <span className="font-extrabold text-gray-900 text-2xl">₹{finalTotal.toFixed(0)}</span>
                    </div>
                    {deliveryCharge === 0 && (
                      <div className="mt-2 bg-green-50 text-green-700 text-xs font-bold px-3 py-2 rounded-lg text-center border border-green-100">
                        ✨ You saved ₹50 on delivery
                      </div>
                    )}
                    {appliedCoupon && (
                        <div className="mt-1 bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1.5 rounded-lg text-center border border-blue-100 uppercase tracking-tight">
                          Total savings: ₹{(50 - deliveryCharge + appliedCoupon.discount).toFixed(0)} with this order!
                        </div>
                     )}
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/30 hover:-translate-y-0.5 text-white font-bold py-4 rounded-xl transition-all duration-200 mt-6 text-base"
                >
                  Proceed to Checkout <ChevronRight size={18} />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 pb-8 lg:pb-0">
                <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm">
                  <span className="text-2xl">🛡️</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">100% Genuine</span>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm">
                  <span className="text-2xl">🔐</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Secure Payment</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky checkout */}
      {cart.length > 0 && (
        <>
          <div className="lg:hidden h-24"></div> {/* Spacer for fixed bottom bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe flex items-center gap-4 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-0.5">{cartCount} items</p>
              <p className="font-extrabold text-gray-900 text-xl">₹{finalTotal.toFixed(0)}</p>
            </div>
            <button
              onClick={handleCheckout}
              className="flex items-center gap-2 bg-teal-600 active:bg-teal-700 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-md"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
