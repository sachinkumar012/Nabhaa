import { useState } from 'react';
import { Shield, CheckCircle, Heart, Users, Phone, ArrowRight, Star, Clock, FileText, IndianRupee } from 'lucide-react';

const PLANS = [
  {
    id: 1,
    name: 'Basic Health',
    price: '₹299/month',
    coverage: '₹3 Lakh',
    color: 'from-blue-500 to-blue-600',
    badge: 'Popular',
    features: [
      'Hospitalization cover up to ₹3 Lakh',
      'No medical check-up required',
      'Cashless treatment at 500+ hospitals',
      'Free annual health check-up',
    ],
  },
  {
    id: 2,
    name: 'Family Shield',
    price: '₹599/month',
    coverage: '₹5 Lakh',
    color: 'from-teal-500 to-teal-600',
    badge: 'Best Value',
    features: [
      'Covers entire family (up to 6 members)',
      'Maternity & newborn coverage',
      'Pre & post hospitalization (60/90 days)',
      'Ambulance charges covered',
      'Free teleconsultation',
    ],
  },
  {
    id: 3,
    name: 'Premium Care',
    price: '₹999/month',
    coverage: '₹10 Lakh',
    color: 'from-purple-500 to-purple-600',
    badge: 'Premium',
    features: [
      'Super top-up cover ₹10 Lakh',
      'Critical illness coverage',
      'International treatment support',
      'Personal health manager',
      'Priority claim settlement',
      'Zero co-payment',
    ],
  },
];

const Insurance = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#075985] to-[#1e3a8a] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield size={16} />
            Health Insurance Plans
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Protect Your Family's <br className="hidden sm:block" />
            <span className="text-yellow-300">Health & Future</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Comprehensive health insurance plans starting at just ₹299/month.
            Cashless treatment, instant claims, and 24/7 support.
          </p>
        </div>
      </div>

      {/* Trust Stats */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <Users size={22} />, value: '50,000+', label: 'Happy Members' },
            { icon: <Heart size={22} />, value: '500+', label: 'Network Hospitals' },
            { icon: <Clock size={22} />, value: '< 30 min', label: 'Claim Settlement' },
            { icon: <Star size={22} />, value: '4.8/5', label: 'Customer Rating' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-xl mb-2">
                {stat.icon}
              </div>
              <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">Choose Your Plan</h2>
          <p className="text-gray-500">Select the perfect health insurance for you and your family</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                selectedPlan === plan.id
                  ? 'border-blue-500 shadow-xl shadow-blue-100 scale-[1.02]'
                  : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
              }`}
            >
              {/* Badge */}
              <div className={`bg-gradient-to-r ${plan.color} text-white text-center py-2 text-xs font-bold tracking-wider uppercase`}>
                {plan.badge}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">Coverage up to {plan.coverage}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-gray-900">{plan.price.split('/')[0]}</span>
                  <span className="text-gray-400 text-sm">/month</span>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    selectedPlan === plan.id
                      ? `bg-gradient-to-r ${plan.color} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#0F8B8D] to-[#0ea5e9] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Need Help Choosing?</h2>
          <p className="text-teal-100 mb-6 max-w-xl mx-auto">Our insurance advisors are available 24/7 to help you pick the right plan for your family.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:9318496221" className="bg-white text-teal-700 font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-teal-50 transition-colors shadow-lg">
              <Phone size={18} /> Call 9318496221
            </a>
            <button className="border-2 border-white/50 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors">
              <FileText size={18} /> Compare Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insurance;
