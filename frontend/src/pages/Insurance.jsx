import { useState } from 'react';
import { Shield, CheckCircle, Heart, Users, Phone, ArrowRight, Star, Clock, FileText, X, Loader2, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaymentService from '../services/PaymentService';

const PLANS = [
  {
    id: 1,
    name: 'Basic Health',
    price: 299,
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
    price: 599,
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
    price: 999,
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
  const { user } = useAuth();
  
  // Modals & Flow States
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState(null); // { policyId, policyNumber }

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: '',
    paymentMethod: 'Online',
  });

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    
    try {
        const orderCreation = await PaymentService.createOrder(selectedPlan.price, "INR");
        
        await PaymentService.processOnlinePayment({
            orderId: orderCreation.orderId,
            amount: selectedPlan.price,
            customerName: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: '', city: '', pincode: '',
            onSuccess: async (paymentResponse) => {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const payload = {
                    userId: user?._id || user?.id || null,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    dob: formData.dob,
                    planId: selectedPlan.id,
                    planName: selectedPlan.name,
                    premiumPaid: selectedPlan.price,
                    coverage: selectedPlan.coverage,
                    paymentMethod: formData.paymentMethod,
                    transactionId: paymentResponse.paymentId
                };

                try {
                    const res = await fetch(`${API_URL}/api/insurance/purchase`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const data = await res.json();
                    
                    if (data.success) {
                        setShowCheckout(false);
                        setSuccessData({
                            policyId: data.policyId,
                            policyNumber: data.policyNumber
                        });
                    } else {
                        alert(data.message || 'Failed to purchase insurance');
                    }
                } catch (error) {
                    console.error(error);
                    alert('Something went wrong contacting the server.');
                } finally {
                    setIsProcessing(false);
                }
            },
            onFailure: (err) => {
                alert(`Payment failed: ${err}`);
                setIsProcessing(false);
            }
        });
    } catch (error) {
        console.error(error);
        alert('Could not initialize payment gateway.');
        setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white relative">
      
      {/* ── Background & Hero ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#075985] to-[#1e3a8a] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield size={16} /> Health Insurance Plans
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Protect Your Family's <br className="hidden sm:block" />
            <span className="text-yellow-300">Health & Future</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Comprehensive health insurance plans starting at just ₹299/month.
            Cashless treatment, instant claims, and 24/7 priority support.
          </p>
        </div>
      </div>

      {/* ── Trust Stats ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
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

      {/* ── Plan Grid ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-16 relative z-0">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">Choose Your Plan</h2>
          <p className="text-gray-500">Select the perfect health insurance for you and your family</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border-2 transition-transform hover:scale-[1.02] duration-300 overflow-hidden shadow-sm hover:shadow-xl ${
                 selectedPlan?.id === plan.id ? 'border-teal-500 shadow-teal-100' : 'border-gray-100'
              }`}
            >
              <div className={`bg-gradient-to-r ${plan.color} text-white text-center py-2 text-xs font-bold tracking-wider uppercase`}>
                {plan.badge}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">Coverage up to {plan.coverage}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-400 text-sm">/year</span>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wide bg-gray-900 text-white hover:bg-teal-600 shadow-lg`}
                >
                  Buy Now <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Checkout Modal ────────────────────────────────────────────── */}
      {showCheckout && selectedPlan && !successData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-extrabold text-gray-900">Purchase Plan</h3>
                        <p className="text-xs text-gray-500 font-medium">You selected: {selectedPlan.name}</p>
                    </div>
                    <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600 bg-gray-200/50 p-2 rounded-full">
                        <X size={18} />
                    </button>
                </div>
                
                <form onSubmit={handlePurchase} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Full Name</label>
                            <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" placeholder="e.g. John Doe" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Email</label>
                                <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Phone</label>
                                <input required type="tel" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" placeholder="+91" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Date of Birth</label>
                            <input required type="date" value={formData.dob} onChange={e=>setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 transition-colors text-gray-700" />
                        </div>

                        {/* Summary & Pay */}
                        <div className="mt-6 bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Payable</p>
                                <p className="text-2xl font-extrabold text-gray-900">₹{selectedPlan.price}</p>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isProcessing}
                                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isProcessing ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : 'Pay Securely'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* ── Success Modal ──────────────────────────────────────────────── */}
      {successData && (
         <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in slide-in-from-bottom-2 duration-300 border border-white">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-green-50">
                    <CheckCircle className="text-green-500" size={40} />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Policy Activated!</h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Your <span className="font-bold text-gray-900">{selectedPlan?.name}</span> plan is now active. We've sent the invoice and your digital card to your email.
                </p>

                <div className="bg-gray-50 rounded-xl p-3 mb-6 border border-gray-200 inline-block">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Policy Number</p>
                    <p className="font-mono font-bold text-gray-900 tracking-wider bg-white px-2 py-1 rounded shadow-sm">{successData.policyNumber}</p>
                </div>

                <div className="space-y-3">
                    <a 
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/insurance/card/${successData.policyId}`}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                    >
                        <Download size={18} /> Download Card PDF
                    </a>
                    <button 
                        onClick={() => { setSuccessData(null); setSelectedPlan(null); }}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default Insurance;
