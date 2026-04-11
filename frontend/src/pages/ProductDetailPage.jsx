import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ShoppingCart, Star, Shield, Truck, ChevronRight, AlertCircle,
  FlaskConical, Info, BookOpen, Activity, AlertTriangle, Loader2, Home, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

/* ─── Medicine Style Helpers ──────────────────────────────────────────────── */
const getMedStyle = (med) => {
  const t = `${med?.type || ''} ${med?.name || ''}`.toLowerCase();
  if (t.includes('syrup') || t.includes('liquid'))
    return { from: 'from-purple-100', to: 'to-violet-50', icon: '🍶', color: 'text-purple-600', badge: 'bg-purple-600' };
  if (t.includes('injection') || t.includes('inj'))
    return { from: 'from-red-100', to: 'to-rose-50', icon: '💉', color: 'text-red-600', badge: 'bg-red-600' };
  if (t.includes('drop'))
    return { from: 'from-sky-100', to: 'to-blue-50', icon: '💧', color: 'text-sky-600', badge: 'bg-sky-600' };
  if (t.includes('cream') || t.includes('gel') || t.includes('oint'))
    return { from: 'from-amber-100', to: 'to-yellow-50', icon: '🧴', color: 'text-amber-600', badge: 'bg-amber-600' };
  if (t.includes('capsule') || t.includes('cap'))
    return { from: 'from-emerald-100', to: 'to-green-50', icon: '🟢', color: 'text-emerald-600', badge: 'bg-emerald-600' };
  if (t.includes('vitamin') || t.includes('supplement'))
    return { from: 'from-orange-100', to: 'to-amber-50', icon: '🌟', color: 'text-orange-600', badge: 'bg-orange-500' };
  return { from: 'from-teal-100', to: 'to-cyan-50', icon: '💊', color: 'text-teal-600', badge: 'bg-teal-600' };
};

const TABS = [
  { id: 'description', label: 'Description', icon: <BookOpen size={14} /> },
  { id: 'ingredients', label: 'Ingredients', icon: <FlaskConical size={14} /> },
  { id: 'uses', label: 'Key Uses', icon: <Activity size={14} /> },
  { id: 'howto', label: 'How to Use', icon: <Info size={14} /> },
  { id: 'safety', label: 'Safety Info', icon: <AlertTriangle size={14} /> },
];

const RelatedCard = ({ med, onAdd, onClick }) => {
  const s = getMedStyle(med);
  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl p-3 w-40 shrink-0 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className={`w-full h-16 bg-gradient-to-br ${s.from} ${s.to} rounded-xl flex items-center justify-center text-2xl mb-2 group-hover:scale-105 transition-transform`}>
        {s.icon}
      </div>
      <p className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[2rem]">{med.name}</p>
      <p className="text-xs font-extrabold text-teal-600 mt-1">₹{med.price}</p>
      <button
        className="w-full mt-2 bg-teal-50 hover:bg-teal-500 hover:text-white text-teal-700 text-[11px] font-bold py-1.5 rounded-lg transition-all border border-teal-200"
        onClick={(e) => { e.stopPropagation(); onAdd(med, 1); }}
      >
        + Add
      </button>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────────────────── */
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setAuthModalOpen } = useAuth();
  const { addToCart, getCartQty } = useCart();

  const [medicine, setMedicine] = useState(null);
  const [relatedMedicines, setRelatedMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [addedFlash, setAddedFlash] = useState(false);

  /* Fetch medicine by ID */
  useEffect(() => {
    const fetchMedicine = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/medicines/${id}`);
        if (!res.ok) throw new Error('Medicine not found');
        const data = await res.json();
        const med = data.data || data;
        const mapped = {
          id: med._id,
          name: med.name,
          type: med.type || 'Medicine',
          price: med.price,
          originalPrice: Math.round(med.price * 1.25),
          discount: 20,
          description: med.composition || med.name,
          manufacturer: med.manufacturer,
          packSize: med.packSize || 'Standard Pack',
          pricePerUnit: (med.price / 10).toFixed(2),
          uses: med.uses || ['General health management', 'As prescribed by doctor'],
          precautions: med.precautions || [
            'Keep out of reach of children',
            'Do not use if allergic to any ingredient',
            'Consult a doctor if pregnant or breastfeeding',
            'Check expiry date before use',
          ],
          dosage: med.dosage || 'As prescribed by your doctor',
          storage: med.storage || 'Store in a cool, dry place below 25°C',
          pharmacist: med.pharmacist?._id || med.pharmacist,
          returnPolicy: '7 days return',
          images: med.images || [],
        };
        setMedicine(mapped);

        /* Fetch related medicines */
        const relRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/medicines?limit=12`
        );
        if (relRes.ok) {
          const relData = await relRes.json();
          const related = relData.data
            .filter(m => m._id !== id)
            .slice(0, 8)
            .map(m => ({
              id: m._id,
              name: m.name,
              type: m.type || 'Medicine',
              price: m.price,
              manufacturer: m.manufacturer,
            }));
          setRelatedMedicines(related);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMedicine();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) { setAuthModalOpen(true); return; }
    addToCart(medicine, qty);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1800);
  };

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <Loader2 size={40} className="animate-spin text-teal-500" />
          <p className="text-sm font-medium">Loading product details…</p>
        </div>
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────────────── */
  if (error || !medicine) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <AlertCircle size={48} className="text-red-400" />
          <h2 className="font-bold text-xl text-gray-800">Product Not Found</h2>
          <p className="text-gray-500 text-sm">{error || 'This medicine could not be loaded.'}</p>
          <button
            onClick={() => navigate('/pharmacy')}
            className="bg-teal-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-600 transition-colors mt-2"
          >
            Back to Pharmacy
          </button>
        </div>
      </div>
    );
  }

  const style = getMedStyle(medicine);
  const thumbs = [style.icon, '📦', '🏷️', '📋'];
  const cartQty = getCartQty ? getCartQty(medicine.id) : 0;

  const tabContent = {
    description: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p className="text-sm">{medicine.name} is a commonly prescribed medicine used for effective treatment. Manufactured by <strong className="text-gray-800">{medicine.manufacturer}</strong>.</p>
        <p className="text-sm">Pack size: <strong className="text-gray-800">{medicine.packSize}</strong></p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
          <p className="font-semibold text-blue-800 mb-1">Important</p>
          <p className="text-blue-700">This medicine should be taken as directed by your physician. Do not self-medicate.</p>
        </div>
      </div>
    ),
    ingredients: (
      <div className="space-y-3">
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
          <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">Active Composition</p>
          <p className="text-sm font-semibold text-gray-800">{medicine.description || 'Composition details available on packaging'}</p>
        </div>
        <p className="text-xs text-gray-400">* Contains inactive/excipient ingredients as per formulation. Check packaging for complete list.</p>
      </div>
    ),
    uses: (
      <ul className="space-y-2.5">
        {(medicine.uses).map((u, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">{i + 1}</div>
            {u}
          </li>
        ))}
      </ul>
    ),
    howto: (
      <div className="space-y-3 text-sm text-gray-600">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
          {[
            { label: 'Dosage', value: medicine.dosage },
            { label: 'Route', value: 'Take orally with water unless otherwise directed' },
            { label: 'Storage', value: medicine.storage },
          ].map(({ label, value }) => (
            <p key={label} className="flex items-start gap-2">
              <span className="font-bold text-indigo-700 w-16 shrink-0">{label}:</span>
              <span>{value}</span>
            </p>
          ))}
        </div>
        <p className="text-xs text-gray-400">Always read the label before use. Do not exceed the stated dose.</p>
      </div>
    ),
    safety: (
      <div className="space-y-2.5">
        {medicine.precautions.map((p, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
            <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
            {p}
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in">

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
          <Link to="/" className="flex items-center gap-1 hover:text-teal-600 transition-colors font-medium">
            <Home size={13} /> Home
          </Link>
          <ChevronRight size={12} className="text-gray-300" />
          <Link to="/pharmacy" className="hover:text-teal-600 transition-colors font-medium">Pharmacy</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-gray-800 font-semibold truncate max-w-[200px]">{medicine.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Back Button ──────────────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-700 transition-colors mb-6 group"
        >
          <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center group-hover:border-teal-300 group-hover:bg-teal-50 transition-all shadow-sm">
            <ArrowLeft size={15} />
          </div>
          Back
        </button>

        {/* ── Main Product Section ─────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* LEFT — Image + Gallery ───────────────────────────────── */}
            <div className="p-6 lg:p-8 flex flex-col gap-4 lg:border-r border-gray-100">
              {/* Main image */}
              <div className="bg-white rounded-2xl flex items-center justify-center min-h-[280px] lg:min-h-[340px] relative overflow-hidden">
                <div className={`absolute top-3 left-3 ${style.badge} text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10`}>
                  {medicine.discount}% OFF
                </div>
                {medicine.images && medicine.images.length > 0 ? (
                  <div className="w-48 h-48 lg:w-64 lg:h-64 bg-white/90 rounded-2xl flex items-center justify-center shadow-md p-2 relative z-0">
                    <img 
                      src={medicine.images[activeThumb] || medicine.images[0]} 
                      alt={medicine.name} 
                      className="max-w-full max-h-full object-contain mix-blend-multiply" 
                    />
                  </div>
                ) : (
                  <div className="w-36 h-36 lg:w-48 lg:h-48 bg-white/70 rounded-2xl flex items-center justify-center text-7xl lg:text-8xl shadow-lg ring-4 ring-white">
                    {thumbs[activeThumb]}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              <div className="flex gap-2.5">
                {(medicine.images && medicine.images.length > 0 ? medicine.images : thumbs).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThumb(i)}
                    className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl transition-all overflow-hidden bg-white
                      ${activeThumb === i
                        ? 'border-teal-500 shadow-md shadow-teal-100'
                        : 'border-gray-200 bg-gray-50 hover:border-teal-300'
                      }`}
                  >
                    {medicine.images && medicine.images.length > 0 ? (
                      <img src={item} alt="" className="w-full h-full object-cover" />
                    ) : (
                      item
                    )}
                  </button>
                ))}
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {[
                  { icon: <Shield size={13} />, text: '100% Genuine', cls: 'text-green-700 bg-green-50 border-green-200' },
                  { icon: <Truck size={13} />, text: '2-Day Delivery', cls: 'text-blue-700 bg-blue-50 border-blue-200' },
                  { icon: <Star size={13} fill="currentColor" />, text: '4.5 Rated', cls: 'text-amber-700 bg-amber-50 border-amber-100' },
                  { icon: <Package size={13} />, text: '7-Day Returns', cls: 'text-purple-700 bg-purple-50 border-purple-100' },
                ].map(({ icon, text, cls }) => (
                  <span key={text} className={`flex items-center gap-1.5 ${cls} text-xs font-semibold px-3 py-1.5 rounded-full border`}>
                    {icon} {text}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT — Info + Actions ──────────────────────────────── */}
            <div className="p-6 lg:p-8 flex flex-col gap-5">
              {/* Type + Name + Brand */}
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${style.color} bg-opacity-10 px-2 py-0.5 rounded-md`}>
                  {medicine.type}
                </span>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mt-2 leading-tight">{medicine.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  by <span className="font-semibold text-gray-700">{medicine.manufacturer}</span>
                </p>
              </div>

              {/* Price block */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-extrabold text-gray-900">₹{medicine.price}</span>
                  <span className="text-lg text-gray-400 line-through">₹{medicine.originalPrice}</span>
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2.5 py-0.5 rounded-full">
                    {medicine.discount}% OFF
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">≈ ₹{medicine.pricePerUnit}/unit · {medicine.packSize}</p>
              </div>

              {/* Highlights row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Composition', value: medicine.description },
                  { label: 'Pack Size', value: medicine.packSize },
                  { label: 'Return Policy', value: medicine.returnPolicy },
                  { label: 'Availability', value: 'In Stock' },
                ].map(({ label, value }) => (
                  value ? (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{value}</p>
                    </div>
                  ) : null
                ))}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <button
                    className="px-4 py-3 text-gray-700 hover:bg-gray-200 font-bold text-lg transition-colors"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                  >−</button>
                  <span className="px-5 font-bold text-gray-800 text-lg min-w-[2.5rem] text-center">{qty}</span>
                  <button
                    className="px-4 py-3 text-gray-700 hover:bg-gray-200 font-bold text-lg transition-colors"
                    onClick={() => setQty(q => Math.min(99, q + 1))}
                  >+</button>
                </div>
                <button
                  className={`flex-1 flex items-center justify-center gap-2.5 font-bold py-3.5 rounded-xl transition-all text-sm shadow-lg min-w-[160px]
                    ${addedFlash
                      ? 'bg-green-500 text-white shadow-green-100 scale-95'
                      : 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-teal-100 hover:shadow-teal-200'
                    }`}
                  onClick={handleAddToCart}
                >
                  {addedFlash ? (
                    <><span>✓</span> Added to Cart!</>
                  ) : (
                    <><ShoppingCart size={17} /> Add {qty > 1 ? `(${qty})` : ''} to Cart</>
                  )}
                </button>
              </div>

              {/* Cart count indicator */}
              {cartQty > 0 && !addedFlash && (
                <p className="text-xs text-teal-600 font-semibold text-center bg-teal-50 rounded-lg py-2">
                  ✓ {cartQty} already in your cart
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabbed Info Section ──────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Tab nav */}
          <div className="border-b border-gray-100 flex gap-0 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-bold whitespace-nowrap border-b-2 transition-all
                  ${activeTab === tab.id
                    ? 'border-teal-500 text-teal-600 bg-teal-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6 lg:p-8">
            {tabContent[activeTab]}
          </div>
        </div>

        {/* ── Related Products ─────────────────────────────────────────── */}
        {relatedMedicines.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 lg:px-8 pt-6 pb-4">
              <h2 className="font-extrabold text-gray-800 text-lg">Customers Also Bought</h2>
              <Link to="/pharmacy" className="text-teal-600 text-xs font-semibold flex items-center gap-1 hover:text-teal-800 transition-colors">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-6 lg:px-8 pb-6">
              {relatedMedicines.map((med) => (
                <RelatedCard
                  key={med.id}
                  med={med}
                  onAdd={(m) => {
                    if (!user) { setAuthModalOpen(true); return; }
                    addToCart(m, 1);
                  }}
                  onClick={() => navigate(`/product/${med.id}`)}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Mobile sticky Add to Cart ────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center gap-3 z-30 shadow-lg">
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-gray-900">₹{medicine.price}</span>
          <span className="text-xs text-gray-400 line-through">₹{medicine.originalPrice}</span>
        </div>
        <button
          className={`flex-1 flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all text-sm
            ${addedFlash
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700'
            }`}
          onClick={handleAddToCart}
        >
          {addedFlash ? '✓ Added!' : <><ShoppingCart size={16} /> Add to Cart</>}
        </button>
      </div>
      {/* Spacer for mobile sticky bar */}
      <div className="lg:hidden h-20" />

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;
