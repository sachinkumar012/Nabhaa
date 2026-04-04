import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FiUser, 
    FiMail, 
    FiPhone, 
    FiMapPin, 
    FiBriefcase, 
    FiZap, 
    FiCheckCircle, 
    FiCamera,
    FiLock,
    FiShield,
    FiExternalLink
} from 'react-icons/fi';
import PharmacistSidebar from '../../components/Pharmacist/PharmacistSidebar';
import { useAuth } from '../../context/AuthContext';

export default function PharmacistProfile() {
    const { pharmacist, pharmacistToken, loginPharmacist } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: pharmacist?.name || '',
        pharmacyName: pharmacist?.pharmacyName || '',
        email: pharmacist?.email || '',
        phone: pharmacist?.phone || '',
        address: pharmacist?.address || '',
        licenseNumber: pharmacist?.licenseNumber || ''
    });

    useEffect(() => {
        if (pharmacist) {
            setFormData({
                name: pharmacist.name || '',
                pharmacyName: pharmacist.pharmacyName || '',
                email: pharmacist.email || '',
                phone: pharmacist.phone || '',
                address: pharmacist.address || '',
                licenseNumber: pharmacist.licenseNumber || ''
            });
        }
    }, [pharmacist]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const config = {
                headers: { Authorization: `Bearer ${pharmacistToken}` }
            };
            const response = await axios.put('/api/pharmacist/profile', formData, config);
            if (response.data.success) {
                loginPharmacist(response.data.user, pharmacistToken);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Failed to update profile", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <PharmacistSidebar />
            
            <main className="flex-grow p-8 lg:p-12 max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Personal Profile</h1>
                    <p className="text-slate-500 font-medium">Manage your personal information and pharmacy certification.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Profile Summary Card */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm text-center relative overflow-hidden group">
                            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-10 group-hover:opacity-20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="relative inline-block mt-4">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${user?.name || 'Pharmacist'}&background=6366f1&color=fff&bold=true&size=512`} 
                                        alt="Profile Large" 
                                        className="w-40 h-40 rounded-[2.5rem] shadow-2xl border-4 border-white mb-6 group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <button className="absolute bottom-2 right-2 w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:scale-110 transition-all border border-slate-50 duration-300">
                                        <FiCamera size={18} />
                                    </button>
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{user?.name}</h3>
                                <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mt-2">{user?.pharmacyName}</p>
                                
                                <div className="mt-10 flex flex-col items-center gap-4 py-6 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                                        <FiShield className="text-emerald-500" />
                                        <span>Verified Partner</span>
                                    </div>
                                    <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 font-black text-[10px] tracking-widest uppercase">
                                        Member Since: {new Date().getFullYear()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* License Card */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden group transition-all hover:scale-[1.02]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform blur-3xl"></div>
                            <h4 className="text-lg font-bold mb-8 flex items-center justify-between relative z-10">
                                Certification
                                <FiZap className="text-amber-400 animate-pulse" />
                            </h4>
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">License No.</p>
                                    <p className="text-xl font-black tracking-tight text-amber-50 group-hover:text-amber-400 transition-colors uppercase">{user?.licenseNumber}</p>
                                </div>
                                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Verification Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        <span className="text-sm font-bold">Approved & Active</span>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full mt-10 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 relative z-10">
                                <FiExternalLink /> View Digital Certificate
                            </button>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2rem] p-10 lg:p-16 border border-slate-100 shadow-sm overflow-hidden relative">
                            {success && (
                                <div className="absolute top-0 inset-x-0 p-4 bg-emerald-500 text-white font-bold text-center text-sm flex items-center justify-center gap-2 animate-slideDown z-20">
                                    <FiCheckCircle /> Profile updated successfully!
                                </div>
                            )}

                            <h3 className="text-2xl font-bold text-slate-800 mb-10 flex items-center gap-4">
                                <span className="w-10 h-10 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <FiSettings />
                                </span>
                                Account Settings
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                        <div className="relative group">
                                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                            <input 
                                                type="text" 
                                                name="name"
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pharmacy Name</label>
                                        <div className="relative group">
                                            <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                            <input 
                                                type="text" 
                                                name="pharmacyName"
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700"
                                                value={formData.pharmacyName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                        <div className="relative group opacity-60">
                                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="email" 
                                                disabled
                                                className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-transparent rounded-2xl outline-none font-bold text-slate-500 cursor-not-allowed"
                                                value={formData.email}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                                        <div className="relative group">
                                            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                            <input 
                                                type="tel" 
                                                name="phone"
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pharmacy Address</label>
                                        <div className="relative group">
                                            <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                            <input 
                                                type="text" 
                                                name="address"
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700"
                                                value={formData.address}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-50">
                                    <button
                                        type="button"
                                        className="text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        <FiLock /> Change Security Password
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-fit px-10 py-5 bg-indigo-600 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-600/10 transition-all transform active:scale-95 disabled:opacity-70 group"
                                    >
                                        {loading ? 'Saving Updates...' : (
                                            <span className="flex items-center gap-2">
                                                Update Profile <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
