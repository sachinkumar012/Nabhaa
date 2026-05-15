import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Mail, Lock, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const DoctorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { loginDoctor } = useAuth();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const { data } = await api.post('/doctors/login', { email, password });
            loginDoctor(data, data.token);
            toast.success('Welcome back, Doctor!');
            navigate('/doctor/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-outfit">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0c4a6e] via-[#075985] to-[#1e3a8a] relative overflow-hidden items-center justify-center p-12">
                {/* Decorative blobs */}
                <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-white text-center"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl mb-8">
                        <Stethoscope size={48} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Nabhaa</h1>
                    <p className="text-xl font-semibold text-blue-200 mb-3">Doctor Portal</p>
                    <p className="text-blue-300 max-w-sm mx-auto leading-relaxed text-sm">
                        Your secure gateway to patient management, video consultations, and digital prescriptions — all in one place.
                    </p>

                    <div className="mt-12 grid grid-cols-3 gap-6">
                        {[
                            { label: 'Patients', value: '2K+' },
                            { label: 'Consults', value: '15K+' },
                            { label: 'Rating', value: '4.9★' },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-xs text-blue-300 mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right Panel — Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-6 sm:p-12">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-8">
                        <div className="bg-blue-600 p-2.5 rounded-xl">
                            <Stethoscope size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Nabhaa</h2>
                            <p className="text-xs text-blue-600 font-semibold">Doctor Portal</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome back</h1>
                        <p className="text-gray-500">Sign in with credentials provided by your admin</p>
                    </div>

                    {/* Security badge */}
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
                        <Shield size={16} className="shrink-0" />
                        <span>Secured with end-to-end encryption. Admin-provisioned accounts only.</span>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="doctor-email">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    id="doctor-email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="doctor@hospital.com"
                                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="doctor-password">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    id="doctor-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    placeholder="Your secure password"
                                    className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700"
                                >
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <Stethoscope size={18} />
                                    Sign In to Doctor Portal
                                </>
                            )}
                        </motion.button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-8">
                        Don't have credentials?{' '}
                        <a
                            href="/admin/login"
                            className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-colors"
                        >
                            Contact your hospital admin →
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default DoctorLogin;
