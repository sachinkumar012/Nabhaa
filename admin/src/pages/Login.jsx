import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const Login = () => {
    const [role, setRole] = useState('admin'); // 'admin' | 'doctor'

    // Admin State
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    // Doctor State
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch doctors when role switches to doctor
    useEffect(() => {
        if (role === 'doctor') {
            const fetchDoctors = async () => {
                try {
                    const { data } = await api.get('/doctors');
                    if (data.success) {
                        setDoctors(data.data);
                        if (data.data.length > 0) {
                            setSelectedDoctorId(data.data[0]._id);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch doctors", error);
                    toast.error("Could not load doctor list");
                }
            };
            fetchDoctors();
        }
    }, [role]);

    // Admin Handlers
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/send-otp', { email });
            toast.success('OTP sent to your email');
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/admin/verify-otp', { email, otp });
            localStorage.setItem('adminToken', data.token);
            toast.success('Login Successful');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // Doctor Handlers
    const handleDoctorLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const selectedDoc = doctors.find(d => d._id === selectedDoctorId);
            if (!selectedDoc) {
                toast.error("Please select a doctor");
                return;
            }

            // Using the existing doctor login endpoint
            const { data } = await api.post('/doctors/login', {
                email: selectedDoc.email,
                password
            });

            localStorage.setItem('doctorToken', data.token);
            localStorage.setItem('doctorInfo', JSON.stringify(data));
            toast.success('Welcome back, Dr. ' + data.name);
            navigate('/doctor-dashboard'); // New route in Admin

        } catch (error) {
            toast.error(error.response?.data?.message || 'Login Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden font-sans">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-900/20 blur-3xl"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-secondary-900/20 blur-3xl"></div>
            </div>

            <div className="card w-full max-w-md z-10 relative animate-fadeInUp border border-gray-800 backdrop-blur-sm p-0 shadow-2xl bg-gray-900/90 rounded-2xl overflow-hidden">

                {/* Header */}
                <div className="p-8 text-center border-b border-gray-800 bg-gray-800/50">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent inline-block">
                        Nabha Portal
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Secure Access Gateway</p>
                </div>

                {/* Role Toggles */}
                <div className="flex border-b border-gray-800">
                    <button
                        className={`flex-1 py-4 text-sm font-semibold transition-all ${role === 'admin' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        onClick={() => setRole('admin')}
                    >
                        ADMIN
                    </button>
                    <button
                        className={`flex-1 py-4 text-sm font-semibold transition-all ${role === 'doctor' ? 'bg-secondary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        onClick={() => setRole('doctor')}
                    >
                        DOCTOR
                    </button>
                </div>

                <div className="p-8">
                    {role === 'admin' ? (
                        /* ADMIN LOGIN FLOW */
                        step === 1 ? (
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="email">
                                        Admin Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none placeholder-gray-600"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-primary-900/50 transition-all transform hover:-translate-y-0.5"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Send OTP"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fadeInScale">
                                <div className="text-center mb-6">
                                    <span className="text-sm text-gray-400">OTP sent to <span className="text-white">{email}</span></span>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-primary-400 text-xs ml-2 hover:text-primary-300 underline"
                                    >
                                        Change
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="otp">
                                        Verification Code
                                    </label>
                                    <input
                                        id="otp"
                                        type="text"
                                        placeholder="• • • • • •"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white text-center text-2xl tracking-[0.5em] focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <button
                                    className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-primary-900/50 transition-all transform hover:-translate-y-0.5"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Verifying..." : "Verify & Login"}
                                </button>
                            </form>
                        )
                    ) : (
                        /* DOCTOR LOGIN FLOW */
                        <form onSubmit={handleDoctorLogin} className="space-y-6">
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                                    Select Profile
                                </label>
                                <select
                                    className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 transition-all outline-none cursor-pointer appearance-none"
                                    value={selectedDoctorId}
                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                    required
                                >
                                    {doctors.map(doc => (
                                        <option key={doc._id} value={doc._id}>
                                            Dr. {doc.name} - {doc.specialty}
                                        </option>
                                    ))}
                                    {doctors.length === 0 && <option value="">Loading doctors...</option>}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 transition-all outline-none placeholder-gray-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                className="w-full py-3 rounded-lg bg-secondary-600 hover:bg-secondary-700 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-secondary-900/50 transition-all transform hover:-translate-y-0.5"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Authenticating..." : "Access Dashboard"}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="absolute bottom-6 text-gray-600 text-xs">
                © 2024 Nabha Healthcare System. Restricted Access.
            </div>
        </div>
    );
};

export default Login;
