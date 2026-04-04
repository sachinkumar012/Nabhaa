import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiMail, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';

export default function PharmacistLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { loginPharmacist } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/pharmacist/login', { email, password });
            if (response.data.success) {
                loginPharmacist(response.data.user, response.data.token);
                navigate('/pharmacist/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-100">
                {/* Visual Side */}
                <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <Link to="/" className="text-2xl font-bold tracking-tight text-white mb-12 block">
                            Nabhaa<span className="text-indigo-200">Health</span>
                        </Link>
                        <h1 className="text-4xl font-bold mb-6 leading-tight">
                            Manage Your Pharmacy <br />With Confidence
                        </h1>
                        <p className="text-indigo-100 text-lg mb-8">
                            Join our network of healthcare professionals and start growing your business with Nabhaa.
                        </p>
                        
                        <div className="space-y-4">
                            {[
                                "Real-time Order Management",
                                "Professional Inventory Control",
                                "Direct Patient Communication",
                                "Detailed Business Analytics"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-indigo-50">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                                        ✓
                                    </div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="relative z-10 mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <p className="text-sm italic text-indigo-50 leading-relaxed">
                            "Nabhaa's pharmacist portal has completely transformed how we handle our daily medicine orders."
                        </p>
                        <p className="text-sm font-semibold mt-3">— Dr. Sharma, Apex Pharma</p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-1/2 p-12 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Pharmacist Login</h2>
                            <p className="text-slate-500 font-medium">Please enter your credentials to access your dashboard.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <FiMail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                                        placeholder="pharmacist@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-slate-700">Password</label>
                                    <Link to="/forgot-password" size="sm" className="text-blue-600 hover:text-blue-700 text-sm font-bold">
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <FiLock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" id="remember" />
                                <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer">Remember me for 30 days</label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {loading ? 'Logging in...' : (
                                    <>
                                        Access Dashboard <FiArrowRight />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                            <p className="text-slate-500 font-medium">
                                Don't have an account yet?{' '}
                                <Link to="/pharmacist/register" className="text-blue-600 hover:text-blue-700 font-bold ml-1">
                                    Join as a Partner
                                </Link>
                            </p>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                            <FiShield />
                            <span>ISO 27001 Certified Security Protocol</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
