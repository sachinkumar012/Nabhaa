import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiBriefcase, FiZap, FiArrowRight, FiShield } from 'react-icons/fi';

export default function PharmacistRegister() {
    const [formData, setFormData] = useState({
        name: '',
        pharmacyName: '',
        email: '',
        phone: '',
        address: '',
        licenseNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { loginPharmacist } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/pharmacist/register', formData);
            if (response.data.success) {
                loginPharmacist(response.data.user, response.data.token);
                navigate('/pharmacist/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 md:py-24">
            <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-slate-100">
                {/* Visual Side */}
                <div className="lg:w-2/5 bg-gradient-to-br from-indigo-700 to-purple-800 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full -ml-40 -mb-40 blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <Link to="/" className="text-2xl font-bold tracking-tight text-white mb-12 block">
                            Nabhaa<span className="text-indigo-200">Health</span>
                        </Link>
                        <h1 className="text-4xl font-bold mb-6 leading-tight">
                            Expand Your Reach <br />With Our Network
                        </h1>
                        <p className="text-indigo-100 text-lg mb-8">
                            Partner with Nabhaa and connect with thousands of patients looking for quality healthcare services.
                        </p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="lg:w-3/5 p-8 md:p-12 lg:p-16">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Join as a Partner</h2>
                        <p className="text-slate-500 font-medium">Register your pharmacy and start receiving orders today.</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Column 1 */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-all">
                                        <FiUser size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-800"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Pharmacy Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-all">
                                        <FiBriefcase size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="pharmacyName"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-800"
                                        placeholder="Community Pharmacy"
                                        value={formData.pharmacyName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-all">
                                        <FiMail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-800"
                                        placeholder="pharmacist@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-all">
                                        <FiPhone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-800"
                                        placeholder="91-XXXXXXXXXX"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">License Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-all">
                                        <FiZap size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="licenseNumber"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-800"
                                        placeholder="DL-XXXXXXXXXX"
                                        value={formData.licenseNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-all">
                                        <FiLock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        minlength="6"
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-800"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-all">
                                        <FiLock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        minlength="6"
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-800"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Pharmacy Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 pt-4 flex items-start pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-all">
                                        <FiMapPin size={18} />
                                    </div>
                                    <textarea
                                        name="address"
                                        required
                                        rows="1"
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-800 resize-none"
                                        placeholder="Your full pharmacy address..."
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 mt-8 pt-8 border-t border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-6">
                            <div className="flex items-start gap-3 order-2 lg:order-1">
                                <input type="checkbox" id="terms" required className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" />
                                <label htmlFor="terms" className="text-sm text-slate-600 font-medium cursor-pointer">
                                    I agree to Nabhaa's <Link to="/terms" className="text-indigo-600 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-indigo-600 font-bold hover:underline">Privacy Policy</Link>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full lg:w-fit px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 order-1 lg:order-2"
                            >
                                {loading ? 'Creating Account...' : (
                                    <>
                                        Register Now <FiArrowRight />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                        <p className="text-slate-500 font-medium">Already have a partner account?</p>
                        <Link to="/pharmacist/login" className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 group">
                            Login into dashboard 
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-400">
                        <FiShield />
                        <span>Security verified and legally compliant portal</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
