import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, User, ShoppingCart, ChevronLeft, ChevronRight, X, CreditCard, Truck, CheckCircle,
  Star, Shield, LogOut, HelpCircle, Ticket, Package, MapPin, Clock, Filter, SlidersHorizontal,
  ArrowUpDown, Loader2, AlertCircle, FileText, Phone, Mail, IndianRupee } from 'lucide-react';

import PaymentService from '../services/PaymentService';
import { useLocationContext } from '../modules/location/presentation/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// New UI Components
import PharmacyBanner from '../components/Pharmacy/PharmacyBanner';

import CategorySidebar, { CATEGORIES } from '../components/Pharmacy/CategorySidebar';
import ProductCard from '../components/Pharmacy/ProductCard';
import CartDrawer from '../components/Pharmacy/CartDrawer';
import TrustBadges from '../components/Pharmacy/TrustBadges';

/* ─────────────────────────────────────────────────────────────────────────────
   SORT OPTIONS
───────────────────────────────────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: 'default', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'discount', label: 'Highest Discount' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PHARMACY COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const Pharmacy = () => {
  const navigate = useNavigate();
  const navLocation = useLocation();
  // ── Data & pagination ────────────────────────────────────────────────────
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 24;

  // ── OTP ─────────────────────────────────────────────────────────────────
  const [emailOtp, setEmailOtp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // ── Location ─────────────────────────────────────────────────────────────
  const { location, detectLocation, isLoading: locationLoading, error: locationError } = useLocationContext();
  useEffect(() => { if (locationError) console.warn(locationError); }, [locationError]);

  // ── Fetch medicines ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/medicines?page=${currentPage}&limit=${itemsPerPage}`
        );
        if (!response.ok) throw new Error('Failed to fetch medicines');
        const data = await response.json();

        const mappedMedicines = data.data.map(med => ({
          id: med._id,
          name: med.name,
          type: med.type || 'Medicine',
          availability: !med.isDiscontinued,
          location: 'Nabha Pharmacy',
          price: med.price,
          originalPrice: Math.round(med.price * 1.25),
          discount: 20,
          description: med.composition || med.name,
          inStock: med.isDiscontinued ? 0 : 100,
          manufacturer: med.manufacturer,
          prescriptionRequired: false,
          packSize: med.packSize || 'Standard Pack',
          pricePerTablet: (med.price / 10).toFixed(2),
          image: null,
          uses: ['General Health'],
          sideEffects: ['Consult Doctor'],
          precautions: ['Keep away from children'],
          directions: 'As prescribed',
          storage: 'Cool dry place',
          dosage: 'As prescribed',
          modeOfAction: 'Medical',
          returnPolicy: '7 days return',
          rating: 4.0,
          reviews: 0,
        }));

        setMedicines(mappedMedicines);
        setTotalPages(data.pagination.pages);
      } catch (err) {
        console.error('Error fetching medicines:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Cart ─────────────────────────────────────────────────────────────────
  const { cart, addToCart: ctxAddToCart, removeFromCart, updateQty, clearCart, getCartQty, cartCount, cartTotal } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');

  // ── Auth ─────────────────────────────────────────────────────────────────
  const { user: currentCustomer, setAuthModalOpen: setShowCustomerAuth, logout } = useAuth();
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', gender: '', address: '', city: '', pincode: '', abhaAddress: '' });

  // ── Checkout form ─────────────────────────────────────────────────────────
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: '', email: '', phone: '', address: '', city: '', pincode: '',
    paymentMethod: 'cod', prescriptionFile: null,
  });

  // ── UI state ─────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcat, setActiveSubcat] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showMobileCats, setShowMobileCats] = useState(false);

  // ── Cart helpers (wraps CartContext, requires login) ─────────────────────
  const addToCart = (medicine, deltaOrQty = 1) => {
    if (!currentCustomer) { setShowCustomerAuth(true); return; }
    if (deltaOrQty === 0) return;
    ctxAddToCart(medicine, deltaOrQty > 0 ? deltaOrQty : 0);
    if (deltaOrQty < 0) {
      const currentQty = getCartQty(medicine.id);
      if (currentQty + deltaOrQty <= 0) removeFromCart(String(medicine.id));
      else updateQty(String(medicine.id), currentQty + deltaOrQty);
    }
  };

  const getCartTotal = () => cartTotal;
  const getCartItemCount = () => cartCount;

  // ── Auto-open checkout when navigated from /cart ─────────────────────────
  useEffect(() => {
    const fromCart = navLocation.state?.openCheckout || sessionStorage.getItem('nabha_open_checkout') === '1';
    if (fromCart && cart.length > 0 && currentCustomer) {
      sessionStorage.removeItem('nabha_open_checkout');
      setCheckoutForm(prev => ({
        ...prev,
        customerName: currentCustomer.name || '',
        email: currentCustomer.email || '',
        phone: currentCustomer.phone || '',
      }));
      setIsCheckoutOpen(true);
    }
  }, [navLocation.state, currentCustomer, cart.length]);

  // ── Checkout ─────────────────────────────────────────────────────────────
  const handleCheckout = () => {
    if (!currentCustomer) { setShowCustomerAuth(true); return; }
    if (cart.length === 0) return;
    setCheckoutForm(prev => ({
      ...prev,
      customerName: currentCustomer.name || '',
      email: currentCustomer.email || '',
      phone: currentCustomer.phone || '',
    }));
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const processOrder = async (e) => {
    e.preventDefault();
    const subtotal = getCartTotal();
    const shippingPrice = subtotal >= 299 ? 0 : 50;
    const totalAmount = subtotal + shippingPrice;

    const backendOrderPayload = {
      userId: currentCustomer?._id || currentCustomer?.id,
      orderItems: cart.map(item => ({
        name: item.name,
        qty: item.quantity || item.qty || 1,
        image: item.image || '',
        price: item.price,
        medicine: item.id || item.productId,
        source: item.source || 'normal',
      })),
      shippingAddress: {
        address: checkoutForm.address,
        city: checkoutForm.city,
        postalCode: checkoutForm.pincode,
        country: 'India',
      },
      paymentMethod: checkoutForm.paymentMethod === 'online' ? 'Online' : 'Cash on Delivery',
      itemsPrice: subtotal,
      taxPrice: 0,
      shippingPrice,
      totalPrice: totalAmount,
      status: 'Pending',
    };

    try {
      if (checkoutForm.paymentMethod === 'online') {
        const customerInfo = {
          name: checkoutForm.customerName, email: checkoutForm.email, phone: checkoutForm.phone,
          address: checkoutForm.address, city: checkoutForm.city, pincode: checkoutForm.pincode,
        };
        const orderCreation = await PaymentService.createOrder(totalAmount, 'INR', customerInfo);
        if (!orderCreation.success) { alert('Failed to initiate payment. Please try again.'); return; }

        await PaymentService.processOnlinePayment({
          orderId: orderCreation.orderId, amount: totalAmount,
          customerName: checkoutForm.customerName, email: checkoutForm.email,
          phone: checkoutForm.phone, address: checkoutForm.address,
          city: checkoutForm.city, pincode: checkoutForm.pincode,
          onSuccess: async (paymentResponse) => {
            const verification = await PaymentService.verifyPayment(paymentResponse);
            if (verification.verified) {
              backendOrderPayload.isPaid = true;
              backendOrderPayload.paymentResult = { id: paymentResponse.paymentId, status: 'Success' };
              await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(currentCustomer?.token ? { Authorization: `Bearer ${currentCustomer.token}` } : {}) },
                body: JSON.stringify(backendOrderPayload),
              });
              clearCart(); setIsCheckoutOpen(false);
              navigate('/orders');
            }
          },
          onFailure: (err) => alert(`Payment failed: ${err}`),
        });
      } else {
        // COD — save to backend
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendOrderPayload),
        });
        if (res.ok) {
          clearCart(); setIsCheckoutOpen(false);
          navigate('/orders');
        } else {
          const errData = await res.json();
          alert(errData.message || 'Failed to place order. Please try again.');
        }
      }
    } catch (err) {
      console.error('Order error:', err);
      alert('Failed to process order. Please try again.');
    }
  };

  // ── OTP ──────────────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!emailOtp) { alert('Please enter your email address.'); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOtp }),
      });
      const data = await res.json();
      if (data.success) { setIsOtpSent(true); alert(data.message); }
      else alert(data.message || 'Failed to send OTP.');
    } catch { alert('Network error. Please try again.'); }
  };

  // ── Order helpers ─────────────────────────────────────────────────────────
  const getOrderStatus = (order) => {
    const now = new Date();
    const hrs = (now - new Date(order.orderDate)) / (1000 * 60 * 60);
    if (hrs < 1) return { status: 'confirmed', message: 'Order Confirmed', progress: 25 };
    if (hrs < 24) return { status: 'processing', message: 'Being Prepared', progress: 50 };
    if (now < new Date(order.deliveryDate)) return { status: 'shipping', message: 'Out for Delivery', progress: 75 };
    return { status: 'delivered', message: 'Delivered', progress: 100 };
  };

  const formatDate = (ds) => new Date(ds).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  // ── Profile ───────────────────────────────────────────────────────────────
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentCustomer.email, ...profileForm }),
      });
      const data = await res.json();
      if (data.success) { setShowProfileModal(false); alert('Profile updated!'); }
      else alert(data.message || 'Update failed');
    } catch { alert('Network error'); }
  };

  // ── Filtering & Sorting ───────────────────────────────────────────────────
  const filteredAndSorted = (() => {
    let result = [...medicines];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q) ||
        (m.manufacturer || '').toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory && activeCategory !== 'all') {
      const cat = CATEGORIES.find(c => c.id === activeCategory);
      if (cat && cat.keywords.length > 0) {
        result = result.filter(m => {
          const combined = `${m.name} ${m.type} ${m.description || ''}`.toLowerCase();
          return cat.keywords.some(kw => combined.includes(kw));
        });
      }
    }

    // Sort
    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'name_asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'discount': result.sort((a, b) => (b.discount || 0) - (a.discount || 0)); break;
    }

    return result;
  })();

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RENDER
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  return (
    <div className="min-h-screen bg-slate-50 font-sans">



      {/* ── Promo Banner + Quick Category Pills ───────────────────────── */}
      <PharmacyBanner onCategoryClick={(label) => {
        const cat = CATEGORIES.find(c => c.label === label);
        if (cat) { setActiveCategory(cat.id); window.scrollTo({ top: 300, behavior: 'smooth' }); }
      }} />

      {/* ── Main Layout ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* ── Category Sidebar (desktop only) ─────────────────────── */}
          <CategorySidebar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            activeSubcat={activeSubcat}
            onSubcatChange={setActiveSubcat}
          />

          {/* ── Main Product Area ─────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* ── Toolbar: Search + Sort + Filter ─────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-5 flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="flex-1 min-w-[160px] relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search medicines, compositions..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 bg-gray-50"
                />
              </div>

              {/* Mobile: categories toggle */}
              <button
                className="lg:hidden flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold px-3 py-2.5 rounded-xl"
                onClick={() => setShowMobileCats(v => !v)}
              >
                <Filter size={14} /> Categories
              </button>

              {/* Sort */}
              <div className="relative">
                <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-teal-400 appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Results count */}
              <span className="text-xs text-gray-400 font-medium hidden sm:block">
                {filteredAndSorted.length} products
              </span>
            </div>

            {/* ── Mobile Category Chips ────────────────────────────── */}
            {showMobileCats && (
              <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setShowMobileCats(false); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all shrink-0
                      ${activeCategory === cat.id
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                      }`}
                  >
                    <span>{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Active category breadcrumb ───────────────────────── */}
            {(activeCategory !== 'all' || searchQuery) && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {activeCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full">
                    {CATEGORIES.find(c => c.id === activeCategory)?.icon}{' '}
                    {CATEGORIES.find(c => c.id === activeCategory)?.label}
                    <button onClick={() => setActiveCategory('all')} className="ml-1 hover:text-teal-900">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-gray-900">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* ── Loading State ────────────────────────────────────── */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
                <Loader2 size={36} className="animate-spin text-teal-400" />
                <p className="text-sm font-medium">Loading medicines…</p>
              </div>
            )}

            {/* ── Error State ──────────────────────────────────────── */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <AlertCircle size={40} className="text-red-400" />
                <p className="font-bold text-gray-700">Couldn't load medicines</p>
                <p className="text-sm text-gray-500">{error}</p>
                <button
                  onClick={() => { setError(null); setLoading(true); setCurrentPage(1); }}
                  className="bg-teal-500 text-white text-sm font-bold px-5 py-2 rounded-xl mt-2 hover:bg-teal-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* ── Empty State ──────────────────────────────────────── */}
            {!loading && !error && filteredAndSorted.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <div className="text-5xl">💊</div>
                <p className="font-bold text-gray-700 text-lg">No medicines found</p>
                <p className="text-sm text-gray-400">Try a different search term or category</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="bg-teal-500 text-white text-sm font-bold px-5 py-2 rounded-xl mt-2 hover:bg-teal-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* ── Product Grid ─────────────────────────────────────── */}
            {!loading && !error && filteredAndSorted.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredAndSorted.map(medicine => (
                  <ProductCard
                    key={medicine.id}
                    medicine={medicine}
                    onAdd={addToCart}
                    cartQty={getCartQty(medicine.id)}
                  />
                ))}
              </div>
            )}

            {/* ── Pagination ───────────────────────────────────────── */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white shadow-sm"
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let page;
                    if (totalPages <= 7) page = i + 1;
                    else if (currentPage <= 4) page = i + 1;
                    else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                    else page = currentPage - 3 + i;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all
                          ${currentPage === page
                            ? 'bg-teal-500 text-white shadow-md shadow-teal-100'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-600'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white shadow-sm"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* ── Page info ────────────────────────────────────────── */}
            {!loading && !error && (
              <p className="text-center text-xs text-gray-400 mt-3">
                Page {currentPage} of {totalPages} · {medicines.length} products total
              </p>
            )}

          </div>{/* end main area */}
        </div>{/* end flex */}
      </div>{/* end container */}

      {/* ── Trust Badges ──────────────────────────────────────────────── */}
      <TrustBadges />



      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OVERLAYS / MODALS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      {/* ── Cart Drawer ───────────────────────────────────────────────── */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={(id, qty) => updateQty(String(id), qty)}
        onRemove={(id) => removeFromCart(String(id))}
        onCheckout={handleCheckout}
        getTotal={getCartTotal}
      />

      {/* ── Floating Cart Button (mobile) ─────────────────────────────── */}
      {cart.length > 0 && !isCartOpen && (
        <button
          onClick={() => navigate('/cart')}
          className="fixed bottom-5 right-5 z-30 lg:hidden bg-gradient-to-r from-teal-600 to-teal-500 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-teal-200 flex items-center gap-3 font-bold text-sm animate-bounce-once"
        >
          <ShoppingCart size={18} />
          <span>{getCartItemCount()} item{getCartItemCount() !== 1 ? 's' : ''}</span>
          <span className="bg-white text-teal-600 px-2 py-0.5 rounded-lg text-xs font-extrabold">
            ₹{getCartTotal().toFixed(0)}
          </span>
        </button>
      )}

      {/* ── Profile Sidebar ──────────────────────────────────────────── */}
      {isProfileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setIsProfileSidebarOpen(false)} />
          <div className="w-80 bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg text-gray-800">Account</h2>
              <button onClick={() => setIsProfileSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            {currentCustomer ? (
              <>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {(currentCustomer.name || 'U')[0].toUpperCase()}
                </div>
                <p className="font-bold text-gray-800 text-lg">{currentCustomer.name}</p>
                <p className="text-sm text-gray-500 mb-6">{currentCustomer.email}</p>
                <div className="space-y-2">
                  {[
                    { icon: <Package size={16} />, label: 'My Orders', action: () => { setIsMyOrdersOpen(true); setIsProfileSidebarOpen(false); } },
                    { icon: <User size={16} />, label: 'Edit Profile', action: () => { setProfileForm({ name: currentCustomer.name || '', phone: currentCustomer.phone || '', gender: currentCustomer.gender || '', address: currentCustomer.address || '', city: currentCustomer.city || '', pincode: currentCustomer.pincode || '', abhaAddress: currentCustomer.abhaAddress || '' }); setShowProfileModal(true); setIsProfileSidebarOpen(false); } },
                    { icon: <Ticket size={16} />, label: 'Offers & Coupons', action: () => {} },
                    { icon: <HelpCircle size={16} />, label: 'Help & Support', action: () => {} },
                    { icon: <LogOut size={16} />, label: 'Logout', action: () => { logout(); clearCart(); setIsProfileSidebarOpen(false); }, danger: true },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left
                        ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'}`}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">👤</div>
                <p className="font-bold text-gray-700">Not logged in</p>
                <button
                  onClick={() => { setShowCustomerAuth(true); setIsProfileSidebarOpen(false); }}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Login / Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Checkout Modal ────────────────────────────────────────────── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 rounded-t-3xl flex items-center justify-between">
              <div className="text-white">
                <h2 className="font-bold text-lg">Checkout</h2>
                <p className="text-teal-100 text-xs">{cart.length} items · ₹{(getCartTotal() + (getCartTotal() >= 299 ? 0 : 50)).toFixed(0)} total</p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={processOrder} className="p-6 space-y-4">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Delivery Details</h3>

              {[
                { label: 'Full Name', key: 'customerName', type: 'text', icon: <User size={14} /> },
                { label: 'Email', key: 'email', type: 'email', icon: <Mail size={14} /> },
                { label: 'Phone', key: 'phone', type: 'tel', icon: <Phone size={14} /> },
              ].map(f => (
                <div key={f.key} className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{f.icon}</div>
                  <input
                    required type={f.type} placeholder={f.label}
                    value={checkoutForm[f.key]}
                    onChange={e => setCheckoutForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                  />
                </div>
              ))}

              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-3.5 text-gray-400" />
                <textarea
                  required placeholder="Delivery Address"
                  value={checkoutForm.address}
                  onChange={e => setCheckoutForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  required placeholder="City" value={checkoutForm.city}
                  onChange={e => setCheckoutForm(prev => ({ ...prev, city: e.target.value }))}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400"
                />
                <input
                  required placeholder="Pincode" value={checkoutForm.pincode}
                  onChange={e => setCheckoutForm(prev => ({ ...prev, pincode: e.target.value }))}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400"
                />
              </div>

              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider pt-2">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
                  { value: 'online', label: 'Pay Online', icon: '💳' },
                ].map(pm => (
                  <label
                    key={pm.value}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${checkoutForm.paymentMethod === pm.value ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="radio" name="payment" value={pm.value}
                      checked={checkoutForm.paymentMethod === pm.value}
                      onChange={() => setCheckoutForm(prev => ({ ...prev, paymentMethod: pm.value }))}
                      className="hidden"
                    />
                    <span className="text-xl">{pm.icon}</span>
                    <span className="text-sm font-semibold text-gray-700">{pm.label}</span>
                  </label>
                ))}
              </div>

              {/* Order summary */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span className="font-semibold">₹{getCartTotal().toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className={`font-semibold ${getCartTotal() >= 299 ? 'text-green-600' : ''}`}>
                    {getCartTotal() >= 299 ? 'FREE' : '₹50'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 text-base">
                  <span>Total</span>
                  <span>₹{(getCartTotal() + (getCartTotal() >= 299 ? 0 : 50)).toFixed(0)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg text-sm"
              >
                {checkoutForm.paymentMethod === 'online' ? '💳 Pay Now' : '✅ Place Order (COD)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── My Orders Modal ───────────────────────────────────────────── */}
      {isMyOrdersOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="font-bold text-white text-lg">My Orders</h2>
              <button onClick={() => setIsMyOrdersOpen(false)} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              {orderHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="text-5xl">📦</div>
                  <p className="font-bold text-gray-700">No orders yet</p>
                  <p className="text-sm text-gray-400">Your orders will appear here once placed</p>
                </div>
              ) : (
                orderHistory.map(order => {
                  const { message, progress } = getOrderStatus(order);
                  return (
                    <div key={order.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400 font-medium">Order #{order.id}</p>
                        <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full">{message}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full mb-3">
                        <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      {order.items.map((item, i) => (
                        <p key={i} className="text-sm text-gray-700 font-medium">{item.name} × {item.quantity}</p>
                      ))}
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-gray-500">{formatDate(order.orderDate)}</span>
                        <span className="font-bold text-gray-800">₹{order.total}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Pharmacy;