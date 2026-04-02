import React from 'react';
import { ShieldCheck, RefreshCw, Truck, HeartPulse, Award, Clock } from 'lucide-react';

const badges = [
  {
    icon: <ShieldCheck size={28} className="text-teal-500" />,
    title: '100% Genuine',
    desc: 'All medicines are sourced directly from licensed manufacturers',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
  {
    icon: <Award size={28} className="text-emerald-500" />,
    title: 'Licensed Pharmacy',
    desc: 'Nabha Health Mart is a government-registered pharmacy',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    icon: <Truck size={28} className="text-blue-500" />,
    title: '2-Day Delivery',
    desc: 'Fast home delivery across Nabha and nearby areas',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: <RefreshCw size={28} className="text-purple-500" />,
    title: '7-Day Returns',
    desc: 'Hassle-free return policy for damaged or wrong items',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    icon: <HeartPulse size={28} className="text-rose-500" />,
    title: 'Expert Support',
    desc: 'Certified pharmacist available for consultation',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  {
    icon: <Clock size={28} className="text-amber-500" />,
    title: 'Open 10AM–7PM',
    desc: 'Visit us or order online, we\'re here to help',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
];

const TrustBadges = () => (
  <section className="bg-white py-10 border-t border-gray-100 mt-8">
    <div className="max-w-7xl mx-auto px-4">
      <h3 className="text-center text-lg font-bold text-gray-700 mb-6 tracking-tight">
        Why Shop at <span className="text-teal-600">Nabha Health Mart</span>?
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {badges.map((b) => (
          <div
            key={b.title}
            className={`${b.bg} ${b.border} border rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow`}
          >
            {b.icon}
            <div className="text-sm font-bold text-gray-800">{b.title}</div>
            <div className="text-xs text-gray-500 leading-snug">{b.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBadges;
