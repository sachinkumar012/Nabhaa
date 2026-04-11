import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/adminApi';
import { Mail, Lock, Loader2, Users, ShoppingBag, BarChart3, ShieldCheck, Activity } from 'lucide-react';

const AdminLogin = () => {
    const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const navigate = useNavigate();
    const { loginAdmin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError('');
        try {
            const endpoint = isLogin ? '/admin/login' : '/admin/register';
            console.log('Attempting admin action:', isLogin ? 'Login' : 'Register', 'at', endpoint);
            const { data } = await api.post(endpoint, { email, password });
            console.log('Admin auth response:', data);
            
            if (data.token) {
                loginAdmin(data, data.token); // Pass full data to match Context expectations
                
                if (rememberMe && isLogin) {
                    localStorage.setItem('adminEmail', email);
                } else if (isLogin) {
                    localStorage.removeItem('adminEmail');
                }
                
                toast.success(isLogin ? 'Admin authenticated successfully' : 'Admin account created successfully');
                console.log('Navigating to /admin/dashboard');
                navigate('/admin/dashboard');
            } else {
                throw new Error('Authentication failed: No token received');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || (isLogin ? 'Invalid credentials. Please try again.' : 'Registration failed. Please try again.');
            setFormError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans bg-gray-50">
            {/* LEFT SIDE: Branding Panel */}
            <div className="w-full md:w-5/12 lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="relative z-10 flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                        <ShieldCheck size={24} />
                    </div>
                    <span className="text-xl font-bold tracking-wide">Nabha Portal</span>
                </div>

                <div className="relative z-10 max-w-md mx-auto md:mx-0">
                    <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">
                        Manage Healthcare System Efficiently
                    </h1>
                    <p className="text-indigo-100 text-base md:text-lg mb-10 opacity-90 font-medium">
                        Securely oversee platform users, pharmacy operations, live analytics, and system configurations from your centralized command center.
                    </p>

                    <div className="space-y-5">
                        {[
                            { icon: <Users size={20} />, label: "User Management" },
                            { icon: <Activity size={20} />, label: "Pharmacy Control" },
                            { icon: <ShoppingBag size={20} />, label: "Order Monitoring" },
                            { icon: <BarChart3 size={20} />, label: "Analytics Dashboard" }
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-indigo-100/90 group">
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/50 transition-colors border border-indigo-400/20">
                                    {feature.icon}
                                </div>
                                <span className="font-semibold">{feature.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 mt-12 md:mt-24 pt-8 border-t border-indigo-400/30 hidden md:block">
                    <p className="text-xs text-indigo-200/80 font-medium tracking-wide uppercase">
                        Enterprise Grade Security • 256-bit Encryption
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE: Login/Register Form */}
            <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative bg-white">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="mb-8">
                        <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">
                            {isLogin ? 'Welcome Back' : 'Create Admin Account'}
                        </h2>
                        <p className="text-gray-500 font-medium">
                            {isLogin ? 'Sign in to your admin account to continue' : 'Register a new administrative profile to the system'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {formError && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                                <div className="text-red-500 mt-0.5"><ShieldCheck size={18} /></div>
                                <p className="text-sm font-semibold text-red-700">{formError}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1" htmlFor="email">
                                Admin Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="Enter your email address"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50 focus:bg-white text-gray-900 font-medium placeholder-gray-400 shadow-sm"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (formError) setFormError('');
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1" htmlFor="password">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50 focus:bg-white text-gray-900 font-medium placeholder-gray-400 shadow-sm"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (formError) setFormError('');
                                    }}
                                />
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex items-center justify-between mt-6">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center justify-center w-5 h-5">
                                        <input
                                            type="checkbox"
                                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500/30 focus:outline-none checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                                            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors select-none">Remember me</span>
                                </label>

                                <button type="button" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200/50 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>{isLogin ? 'Authenticating...' : 'Registering...'}</span>
                                </>
                            ) : (
                                isLogin ? 'Login to Admin Dashboard' : 'Create Admin Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-gray-500">
                            {isLogin ? "Don't have an admin account? " : "Already have an admin account? "}
                            <button 
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setFormError('');
                                }} 
                                className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors underline"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AdminLogin;

