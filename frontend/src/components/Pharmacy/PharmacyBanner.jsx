import React from 'react';
import { Truck, Clock, Star, Shield, CheckCircle, Pill, Heart } from 'lucide-react';

const PharmacyBanner = ({ onCategoryClick }) => {
  const offers = [
    { label: '25% OFF on first order', code: 'FIRST25' },
    { label: 'Free delivery on ₹299+', code: 'FREEDEL' },
    { label: 'Extra 5% with UPI', code: 'UPI5' },
    { label: 'Flat 20% on generics', code: 'GEN20' },
  ];

  const quickCategories = [
    { icon: '💊', label: 'Medicines' },
    { icon: '🧴', label: 'Personal Care' },
    { icon: '🩸', label: 'Diabetes' },
    { icon: '💪', label: 'Vitamins' },
    { icon: '👶', label: 'Baby Care' },
    { icon: '🩺', label: 'Devices' },
    { icon: '🌿', label: 'Homeopathic' },
    { icon: '🧘', label: 'Wellness' },
  ];

  const trustStats = [
    { icon: <Shield size={20} />, value: '100%', label: 'Genuine Medicines' },
    { icon: <Truck size={20} />, value: '2-Day', label: 'Express Delivery' },
    { icon: <CheckCircle size={20} />, value: '10K+', label: 'Products Available' },
    { icon: <Star size={20} />, value: '4.8/5', label: 'Customer Rating' },
  ];

  return (
    <div className="w-full">
      {/* ── Hero Section — Premium gradient ─────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#075985] via-[#0e7490] to-[#1e3a8a] text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-teal-400/10 rounded-full -translate-y-1/2 blur-xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left content */}
            <div className="text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border border-white/20">
                <Pill size={14} />
                Licensed Medical Store
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
                Nabha <span className="text-yellow-300">Health Mart</span>
              </h2>
              <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-6">
                Genuine medicines at best prices. Prescription & OTC medicines delivered to your doorstep with express delivery.
              </p>

              {/* Info pills */}
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start text-xs">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <Truck size={13} /> Express Delivery
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <Clock size={13} /> 10AM – 7PM
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <Star size={13} /> 4.8 Rated
                </span>
              </div>
            </div>

            {/* Right — Offer tags */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-end max-w-sm">
              {offers.map((o) => (
                <span
                  key={o.code}
                  className="bg-white/15 border border-white/25 text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-sm cursor-pointer hover:bg-white/25 transition-all select-none shadow-sm"
                >
                  {o.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Trust Stats — overlapping card ──────────────────────────── */}
        <div className="relative max-w-7xl mx-auto px-4 -mb-8 pb-2 z-10">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-5 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {trustStats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-teal-50 text-teal-600 rounded-xl mb-2">
                  {stat.icon}
                </div>
                <p className="text-lg font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-[11px] text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Category Pills ──────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 pt-12 pb-3">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2.5 min-w-max">
            {quickCategories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => onCategoryClick?.(cat.label)}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 border border-teal-100 text-teal-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:shadow-md whitespace-nowrap"
              >
                <span className="text-base">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyBanner;
