import { useState } from 'react';
import { X, Pill, Tablet, Stethoscope, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function AuthSidebar({ isOpen, onClose }) {
    const { login } = useAuth();
    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = () => {
        if (phoneNumber.length < 10) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setStep('otp');
            // In a real app, you would trigger the SMS here
        }, 1500);
    };

    const handleVerifyOtp = () => {
        if (otp.length < 4) {
            alert('Please enter the valid OTP');
            return;
        }
        setIsLoading(true);
        // Simulate API verification
        setTimeout(() => {
            setIsLoading(false);
            login({ name: 'User', phone: phoneNumber }); // Log the user in
            // alert('Login Successful!'); // Removed alert as we are logging in
            onClose();
            // Reset state after closing
            setTimeout(() => {
                setStep('phone');
                setPhoneNumber('');
                setOtp('');
            }, 500);
        }, 1500);
    };

    const handleBack = () => {
        setStep('phone');
        setOtp('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
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
                                        {step === 'phone' ? 'Login' : 'Verify OTP'}
                                    </h2>
                                    <p className="text-blue-100 text-lg">
                                        {step === 'phone' ? 'or Sign up to continue' : `Sent to +91 ${phoneNumber}`}
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
                            {step === 'phone' ? (
                                <div className="mb-8">
                                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                                        Enter your mobile number
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium border-r border-gray-300 pr-3">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="w-full pl-16 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A73E8] focus:border-[#1A73E8] transition-all text-lg font-medium tracking-wide"
                                            placeholder="Mobile Number"
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
                                            placeholder="Enter 4-digit OTP"
                                            maxLength={6}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="mt-4 flex justify-between items-center text-sm">
                                        <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 font-medium">
                                            Change Number
                                        </button>
                                        <button className="text-[#1A73E8] font-bold hover:underline">
                                            Resend OTP
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={step === 'phone' ? handleSendOtp : handleVerifyOtp}
                                disabled={isLoading}
                                className={`w-full bg-[#1A73E8] hover:bg-[#1557b0] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                        <span>{step === 'phone' ? 'Send OTP' : 'Verify & Login'}</span>
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
