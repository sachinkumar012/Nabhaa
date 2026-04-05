import { useState } from 'react';
import { X, Pill, Tablet, Stethoscope, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AuthSidebar() {
    const { login, isAuthModalOpen, setAuthModalOpen } = useAuth();
    const [step, setStep] = useState('email'); // 'email' | 'otp'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onClose = () => setAuthModalOpen(false);

    const handleSendOtp = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/send-otp`, { email });
            if (response.data.success) {
                toast.success(response.data.message);
                setStep('otp');
            } else {
                toast.error(response.data?.message || 'Failed to send OTP.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 4) {
            toast.error('Please enter a valid OTP');
            return;
        }
        setIsLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify-otp`, { email, otp });

            if (response.data.success) {
                toast.success('Login Successful!');
                login(response.data.user, response.data.token); // Store user and token
                onClose();
                // Reset state after closing
                setTimeout(() => {
                    setStep('email');
                    setEmail('');
                    setOtp('');
                }, 500);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or Expired OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setStep('email');
        setOtp('');
    };

    if (!isAuthModalOpen) return null;

    return (
        <AnimatePresence>
            {isAuthModalOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-[#1A73E8] p-6 relative overflow-hidden min-h-[200px] flex flex-col justify-between">
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Stethoscope size={120} className="text-white transform rotate-12" />
                            </div>

                            <div className="flex justify-between items-start relative z-10">
                                <button
                                    onClick={onClose}
                                    className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="relative z-10 flex justify-between items-end">
                                <div className="mb-2">
                                    <h2 className="text-3xl font-bold text-white mb-2">
                                        {step === 'email' ? 'Login' : 'Verify OTP'}
                                    </h2>
                                    <p className="text-blue-100 text-lg">
                                        {step === 'email' ? 'or Sign up to continue' : `Sent to ${email}`}
                                    </p>
                                </div>

                                {/* Illustration */}
                                <div className="relative">
                                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 shadow-lg transform rotate-6 translate-y-4">
                                        <Pill size={48} className="text-white" />
                                    </div>
                                    <div className="absolute -left-4 -bottom-2 bg-[#00BFA6] p-2 rounded-xl shadow-lg transform -rotate-12">
                                        <Tablet size={24} className="text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex-1 flex flex-col">
                            {step === 'email' ? (
                                <div className="mb-8">
                                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                                        Enter your email address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A73E8] focus:border-[#1A73E8] transition-all text-lg font-medium tracking-wide"
                                            placeholder="Email Address"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-8">
                                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                                        Enter OTP
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A73E8] focus:border-[#1A73E8] transition-all text-lg font-medium tracking-widest text-center"
                                            placeholder="Enter 6-digit OTP"
                                            maxLength={6}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="mt-4 flex justify-between items-center text-sm">
                                        <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 font-medium">
                                            Change Email
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSendOtp()}
                                            disabled={isLoading}
                                            className="text-[#1A73E8] font-bold hover:underline disabled:opacity-50"
                                        >
                                            Resend OTP
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={step === 'email' ? handleSendOtp : handleVerifyOtp}
                                disabled={isLoading}
                                className={`w-full bg-[#1A73E8] hover:bg-[#1557b0] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                        <span>{step === 'email' ? 'Send OTP' : 'Verify & Login'}</span>
                                        <ChevronRight size={20} />
                                    </>
                                )}
                            </button>

                            <div className="mt-auto pt-6 text-xs text-gray-500 text-center leading-relaxed">
                                By continuing, you agree to our{' '}
                                <a href="#" className="text-[#1A73E8] font-semibold hover:underline">Privacy Policy</a>
                                {' '}and{' '}
                                <a href="#" className="text-[#1A73E8] font-semibold hover:underline">Terms and Conditions</a>.
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
