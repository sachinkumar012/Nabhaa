import React from 'react';
import { ShoppingCart, Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* Assign a gradient + emoji based on medicine type/name */
const getMedStyle = (med) => {
  const t = `${med.type || ''} ${med.name || ''}`.toLowerCase();
  if (t.includes('syrup') || t.includes('liquid') || t.includes('syr'))
    return { from: 'from-purple-100', to: 'to-violet-50', icon: '🍶', ring: 'ring-purple-200', badge: 'bg-purple-600' };
  if (t.includes('injection') || t.includes('inj') || t.includes('vial'))
    return { from: 'from-red-100', to: 'to-rose-50', icon: '💉', ring: 'ring-red-200', badge: 'bg-red-600' };
  if (t.includes('drop') || t.includes('eye drop') || t.includes('nasal'))
    return { from: 'from-sky-100', to: 'to-blue-50', icon: '💧', ring: 'ring-sky-200', badge: 'bg-sky-600' };
  if (t.includes('cream') || t.includes('oint') || t.includes('gel') || t.includes('lotion'))
    return { from: 'from-amber-100', to: 'to-yellow-50', icon: '🧴', ring: 'ring-amber-200', badge: 'bg-amber-600' };
  if (t.includes('inhaler') || t.includes('spray') || t.includes('nebul'))
    return { from: 'from-cyan-100', to: 'to-teal-50', icon: '🌬️', ring: 'ring-cyan-200', badge: 'bg-cyan-600' };
  if (t.includes('capsule') || t.includes('cap') || t.includes('softgel'))
    return { from: 'from-emerald-100', to: 'to-green-50', icon: '🟢', ring: 'ring-emerald-200', badge: 'bg-emerald-600' };
  if (t.includes('vitamin') || t.includes('supplement') || t.includes('omega'))
    return { from: 'from-orange-100', to: 'to-amber-50', icon: '💊', ring: 'ring-orange-200', badge: 'bg-orange-500' };
  // Default tablet
  return { from: 'from-teal-100', to: 'to-cyan-50', icon: '💊', ring: 'ring-teal-200', badge: 'bg-teal-600' };
};

const ProductCard = ({ medicine, onAdd, cartQty = 0 }) => {
  const style = getMedStyle(medicine);
  const discount = medicine.discount || 20;
  const originalPrice = medicine.originalPrice || Math.round(medicine.price * 1.25);
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group overflow-hidden flex flex-col"
      onClick={() => navigate(`/product/${medicine.id}`)}
    >
      {/* Image Area */}
      <div className={`relative bg-gradient-to-br ${style.from} ${style.to} p-5 flex items-center justify-center min-h-[130px]`}>
        {/* Discount Badge */}
        <div className={`absolute top-2.5 left-2.5 ${style.badge} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow`}>
          {discount}% OFF
        </div>

        {/* Quick view on hover */}
        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white rounded-full p-1.5 shadow-md">
            <Eye size={13} className="text-gray-500" />
          </div>
        </div>

        {/* Medicine Visual */}
        <div className={`w-20 h-20 rounded-2xl bg-white/70 ring-2 ${style.ring} flex items-center justify-center text-4xl shadow-sm`}>
          {style.icon}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        {/* Medicine Name */}
        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug min-h-[2.5rem]">
          {medicine.name}
        </h3>

        {/* Pack Size / Manufacturer */}
        <p className="text-[11px] text-gray-400 font-medium truncate">
          {medicine.packSize || medicine.manufacturer || 'Standard Pack'}
        </p>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mt-auto pt-1.5">
          <span className="text-base font-extrabold text-gray-900">₹{medicine.price}</span>
          <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          {cartQty > 0 ? (
            <div className="flex items-center justify-between bg-teal-50 border border-teal-300 rounded-xl overflow-hidden">
              <button
                className="px-3 py-2 text-teal-700 font-bold text-lg hover:bg-teal-100 transition-colors"
                onClick={(e) => { e.stopPropagation(); onAdd(medicine, -1); }}
              >−</button>
              <span className="text-sm font-bold text-teal-700">{cartQty}</span>
              <button
                className="px-3 py-2 text-teal-700 font-bold text-lg hover:bg-teal-100 transition-colors"
                onClick={(e) => { e.stopPropagation(); onAdd(medicine, 1); }}
              >+</button>
            </div>
          ) : (
            <button
              className="w-full flex items-center justify-center gap-1.5 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white text-sm font-bold py-2 rounded-xl transition-all shadow-teal-100 shadow-sm hover:shadow-md"
              onClick={(e) => { e.stopPropagation(); onAdd(medicine, 1); }}
            >
              <Plus size={15} strokeWidth={2.5} />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
