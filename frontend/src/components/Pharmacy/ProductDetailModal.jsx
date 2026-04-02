import React, { useState } from 'react';
import { X, ShoppingCart, Star, Shield, Truck, ChevronRight, Plus, AlertCircle, FlaskConical, Info, BookOpen, Activity, AlertTriangle } from 'lucide-react';

const getMedStyle = (med) => {
  const t = `${med.type || ''} ${med.name || ''}`.toLowerCase();
  if (t.includes('syrup') || t.includes('liquid'))
    return { from: 'from-purple-100', to: 'to-violet-50', icon: '🍶', color: 'text-purple-600', light: 'bg-purple-50' };
  if (t.includes('injection') || t.includes('inj'))
    return { from: 'from-red-100', to: 'to-rose-50', icon: '💉', color: 'text-red-600', light: 'bg-red-50' };
  if (t.includes('drop'))
    return { from: 'from-sky-100', to: 'to-blue-50', icon: '💧', color: 'text-sky-600', light: 'bg-sky-50' };
  if (t.includes('cream') || t.includes('gel') || t.includes('oint'))
    return { from: 'from-amber-100', to: 'to-yellow-50', icon: '🧴', color: 'text-amber-600', light: 'bg-amber-50' };
  if (t.includes('capsule') || t.includes('cap'))
    return { from: 'from-emerald-100', to: 'to-green-50', icon: '🟢', color: 'text-emerald-600', light: 'bg-emerald-50' };
  if (t.includes('vitamin') || t.includes('supplement'))
    return { from: 'from-orange-100', to: 'to-amber-50', icon: '🌟', color: 'text-orange-600', light: 'bg-orange-50' };
  return { from: 'from-teal-100', to: 'to-cyan-50', icon: '💊', color: 'text-teal-600', light: 'bg-teal-50' };
};

const TABS = [
  { id: 'description', label: 'Description', icon: <BookOpen size={14} /> },
  { id: 'ingredients', label: 'Ingredients', icon: <FlaskConical size={14} /> },
  { id: 'uses', label: 'Key Uses', icon: <Activity size={14} /> },
  { id: 'howto', label: 'How to Use', icon: <Info size={14} /> },
  { id: 'safety', label: 'Safety Info', icon: <AlertTriangle size={14} /> },
];

const ProductDetailModal = ({ medicine, onClose, onAdd, cartQty = 0, relatedMedicines = [], onRelatedAdd, onRelatedView }) => {
  const [activeTab, setActiveTab] = useState('description');
  const [qty, setQty] = useState(cartQty || 1);

  if (!medicine) return null;

  const style = getMedStyle(medicine);
  const discount = medicine.discount || 20;
  const originalPrice = medicine.originalPrice || Math.round(medicine.price * 1.25);
  const pricePerUnit = medicine.pricePerTablet || (medicine.price / 10).toFixed(2);

  const tabContent = {
    description: (
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
        <p>{medicine.description || medicine.name} is a commonly prescribed medicine used for effective treatment. Manufactured by <strong className="text-gray-800">{medicine.manufacturer}</strong>.</p>
        <p>Pack size: <strong className="text-gray-800">{medicine.packSize || 'Standard Pack'}</strong></p>
        <p>This medicine should be taken as directed by your physician. Do not self-medicate.</p>
      </div>
    ),
    ingredients: (
      <div className="space-y-3">
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
          <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">Active Composition</p>
          <p className="text-sm font-semibold text-gray-800">{medicine.description || 'Composition details available on packaging'}</p>
        </div>
        <p className="text-xs text-gray-500">* Contains inactive/excipient ingredients as per formulation. Check packaging for complete list.</p>
      </div>
    ),
    uses: (
      <ul className="space-y-2">
        {(medicine.uses || ['Pain relief', 'Fever reduction', 'Anti-inflammatory', 'General symptom management']).map((u, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
            <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold">{i + 1}</span>
            </div>
            {u}
          </li>
        ))}
      </ul>
    ),
    howto: (
      <div className="space-y-3 text-sm text-gray-600">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
          <p className="flex items-start gap-2"><span className="font-bold text-blue-700 shrink-0">Dosage:</span> {medicine.dosage || 'As prescribed by your doctor'}</p>
          <p className="flex items-start gap-2"><span className="font-bold text-blue-700 shrink-0">Route:</span> {medicine.directions || 'Take orally with water'}</p>
          <p className="flex items-start gap-2"><span className="font-bold text-blue-700 shrink-0">Storage:</span> {medicine.storage || 'Store in a cool, dry place below 25°C'}</p>
        </div>
        <p className="text-xs text-gray-400">Always read the label before use. Do not exceed the stated dose.</p>
      </div>
    ),
    safety: (
      <div className="space-y-2.5">
        {(medicine.precautions || [
          'Keep out of reach of children',
          'Do not use if allergic to any ingredient',
          'Consult a doctor if pregnant or breastfeeding',
          'Check expiry date before use',
          'Do not use for longer than prescribed',
        ]).map((p, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
            <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
            {p}
          </div>
        ))}
      </div>
    ),
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto sm:hidden absolute left-1/2 -translate-x-1/2 top-2" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Details</p>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {/* Product main section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-6 p-5">
              {/* LEFT — Image */}
              <div className="flex flex-col gap-3">
                <div className={`bg-gradient-to-br ${style.from} ${style.to} rounded-2xl flex items-center justify-center h-56 sm:h-72`}>
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white/70 rounded-2xl flex items-center justify-center text-6xl sm:text-7xl shadow-sm ring-2 ring-white">
                    {style.icon}
                  </div>
                </div>
                {/* Thumbnail strip */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {[style.icon, '📦', '🏷️', '📋'].map((ic, i) => (
                    <button
                      key={i}
                      className={`w-14 h-14 shrink-0 rounded-xl border-2 flex items-center justify-center text-xl transition-all
                        ${i === 0 ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-gray-50 hover:border-teal-200'}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
                {/* Trust row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full font-semibold">
                    <Shield size={11} /> 100% Genuine
                  </span>
                  <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full font-semibold">
                    <Truck size={11} /> 2-Day Delivery
                  </span>
                  <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full font-semibold">
                    <Star size={11} fill="currentColor" /> 4.5
                  </span>
                </div>
              </div>

              {/* RIGHT — Info */}
              <div className="flex flex-col gap-3 mt-4 sm:mt-0">
                <div>
                  <p className="text-xs text-teal-600 font-bold uppercase tracking-wider">{medicine.type || 'Tablet'}</p>
                  <h2 className="text-xl font-extrabold text-gray-900 mt-1 leading-snug">{medicine.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">by <span className="font-semibold text-gray-700">{medicine.manufacturer}</span></p>
                </div>

                {/* Price block */}
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-gray-900">₹{medicine.price}</span>
                    <span className="text-base text-gray-400 line-through">₹{originalPrice}</span>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span>
                  </div>
                  <p className="text-xs text-gray-500">≈ ₹{pricePerUnit}/unit · {medicine.packSize || 'Standard Pack'}</p>
                </div>

                {/* Highlights */}
                <div className="space-y-2">
                  {[
                    { label: 'Composition', value: medicine.description },
                    { label: 'Pack Size', value: medicine.packSize || 'Standard Pack' },
                    { label: 'Return Policy', value: medicine.returnPolicy || '7 days return' },
                  ].map(({ label, value }) => (
                    value ? (
                      <div key={label} className="flex gap-2 text-sm">
                        <span className="text-gray-400 font-medium w-28 shrink-0">{label}</span>
                        <span className="text-gray-700 font-semibold truncate">{value}</span>
                      </div>
                    ) : null
                  ))}
                </div>

                {/* Add to cart */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                    <button
                      className="px-4 py-3 text-gray-700 hover:bg-gray-200 font-bold transition-colors"
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                    >−</button>
                    <span className="px-4 font-bold text-gray-800">{qty}</span>
                    <button
                      className="px-4 py-3 text-gray-700 hover:bg-gray-200 font-bold transition-colors"
                      onClick={() => setQty(q => q + 1)}
                    >+</button>
                  </div>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-teal-100 text-sm"
                    onClick={() => { onAdd(medicine, qty); onClose(); }}
                  >
                    <ShoppingCart size={16} />
                    Add {qty > 1 ? `(${qty})` : ''} to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 pb-2">
              <div className="border-b border-gray-100 flex gap-1 overflow-x-auto scrollbar-hide">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all
                      ${activeTab === tab.id
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="py-4">
                {tabContent[activeTab]}
              </div>
            </div>

            {/* Related Products */}
            {relatedMedicines.length > 0 && (
              <div className="px-5 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800 text-sm">Customers Also Bought</h3>
                  <button className="text-teal-600 text-xs font-semibold flex items-center gap-1">
                    View all <ChevronRight size={13} />
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {relatedMedicines.slice(0, 8).map((med) => (
                    <div
                      key={med.id}
                      className="bg-white border border-gray-100 rounded-xl p-3 w-36 shrink-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onRelatedView?.(med)}
                    >
                      <div className="w-full h-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg flex items-center justify-center text-2xl mb-2">
                        💊
                      </div>
                      <p className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[2rem]">{med.name}</p>
                      <p className="text-xs font-extrabold text-teal-600 mt-1">₹{med.price}</p>
                      <button
                        className="w-full mt-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-bold py-1.5 rounded-lg transition-colors border border-teal-200"
                        onClick={(e) => { e.stopPropagation(); onRelatedAdd?.(med, 1); }}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailModal;
