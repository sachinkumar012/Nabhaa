import html2canvas from 'html2canvas';
import React, { useState, useRef } from 'react';
import { Shield, Smartphone, RefreshCw, CheckCircle, AlertCircle, FileText, User, Camera, Calendar, MapPin, Hash, QrCode } from 'lucide-react';

const AbhaManagement = () => {
    const [activeTab, setActiveTab] = useState('create'); // create, link, profile
    const [step, setStep] = useState(1); // 1: Input, 2: OTP, 3: Registration, 4: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [abhaProfile, setAbhaProfile] = useState(null);
    const cardRef = useRef(null);

    // Initial Input
    const [mobile, setMobile] = useState('');
    const [txnId, setTxnId] = useState('');
    const [otp, setOtp] = useState('');
    const [tempToken, setTempToken] = useState('');

    // Registration Form Data
    const [formData, setFormData] = useState({
        name: '',
        aadhaar: '',
        dob: '',
        gender: '',
        address: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);

    const handleGenerateOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/abha/generate-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile })
            });
            const data = await response.json();
            if (data.success) {
                setTxnId(data.transactionId);
                setStep(2);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/abha/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp, transactionId: txnId })
            });
            const data = await response.json();
            if (data.success) {
                setTempToken(data.tempToken);
                if (activeTab === 'create') {
                    setStep(3); // Go to Registration Form
                } else {
                    await fetchProfile(); // Link existing
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Verification failed. Use OTP 123456.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRegistrationSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/abha/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempToken, ...formData })
            });
            const data = await response.json();
            if (data.success) {
                setAbhaProfile(data.data);
                setStep(4);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/abha/profile`);
            const data = await response.json();
            if (data.success) {
                setAbhaProfile(data.data);
                setStep(4);
            }
        } catch (err) {
            setError('Could not fetch profile.');
        }
    }

    const resetFlow = () => {
        setStep(1);
        setOtp('');
        setMobile('');
        setFormData({ name: '', aadhaar: '', dob: '', gender: '', address: '', image: null });
        setImagePreview(null);
        setError(null);
    };

    const handleDownloadCard = async () => {
        if (cardRef.current) {
            try {
                const canvas = await html2canvas(cardRef.current, {
                    scale: 2,
                    backgroundColor: null,
                    useCORS: true
                });
                const link = document.createElement('a');
                link.download = `ABHA_Card_${abhaProfile.name}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error("Download failed", err);
                alert("Failed to download card. Please try again.");
            }
        }
    };

    const handleShareProfile = async () => {
        if (navigator.share && abhaProfile) {
            try {
                await navigator.share({
                    title: 'My ABHA Profile',
                    text: `Check out my ABHA Profile: ${abhaProfile.abhaAddress}`,
                    url: window.location.href
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            alert("Sharing is not supported on this browser.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <div className="bg-orange-100 p-3 rounded-full">
                            <Shield size={40} className="text-orange-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">ABHA (Ayushman Bharat Health Account)</h1>
                    <p className="mt-2 text-gray-600">Create or link your ABHA ID to manage your health records digitally.</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                    {/* Tabs */}
                    {step !== 4 && (
                        <div className="flex border-b border-gray-200">
                            <button
                                className={`flex-1 py-4 text-center font-medium ${activeTab === 'create' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => { setActiveTab('create'); resetFlow(); }}
                            >
                                Create New ABHA
                            </button>
                            <button
                                className={`flex-1 py-4 text-center font-medium ${activeTab === 'link' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => { setActiveTab('link'); resetFlow(); }}
                            >
                                Link Existing ABHA
                            </button>
                        </div>
                    )}

                    <div className="p-8">
                        {step === 1 && (
                            <form onSubmit={handleGenerateOtp}>
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Mobile Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Smartphone className="text-gray-400" size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="Enter 10-digit Mobile Number"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition duration-200 disabled:opacity-70"
                                >
                                    {loading ? 'Sending OTP...' : 'Get OTP'}
                                </button>

                                <p className="mt-4 text-xs text-center text-gray-500">
                                    By clicking Get OTP, you agree to the Terms and Conditions and Privacy Policy of ABDM.
                                </p>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyOtp}>
                                <div className="text-center mb-6">
                                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Smartphone className="text-green-600" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Verify OTP</h3>
                                    <p className="text-gray-500">Enter the OTP sent to your mobile number (Mock: 123456)</p>
                                </div>

                                <div className="mb-6">
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="XXXXXX"
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition duration-200 disabled:opacity-70"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Proceed'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full mt-3 text-gray-500 text-sm hover:text-gray-700"
                                >
                                    Change Number
                                </button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleRegistrationSubmit}>
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Complete Registration</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="text-gray-400" size={18} />
                                            </div>
                                            <input type="text" className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Your Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Aadhaar Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Hash className="text-gray-400" size={18} />
                                            </div>
                                            <input type="text" className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="12-digit Aadhaar" value={formData.aadhaar} onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="text-gray-400" size={18} />
                                            </div>
                                            <input type="date" className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
                                        <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} required>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Address</label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-3 pointer-events-none">
                                            <MapPin className="text-gray-400" size={18} />
                                        </div>
                                        <textarea className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Full Address" rows="3" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required></textarea>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Profile Photo</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-300">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <User size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                                            <p className="mt-1 text-xs text-gray-500">Upload a clear photo (JPG/PNG)</p>
                                        </div>
                                    </div>
                                </div>

                                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2"><AlertCircle size={18} />{error}</div>}
                                <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition duration-200 disabled:opacity-70">
                                    {loading ? 'Creating ABHA...' : 'Create ABHA ID'}
                                </button>
                            </form>
                        )}

                        {step === 4 && abhaProfile && (
                            <div>
                                <div ref={cardRef} className="bg-gradient-to-br from-teal-600 to-blue-900 rounded-2xl p-8 text-white text-center relative overflow-hidden shadow-2xl border border-teal-500/30">
                                    {/* Decorative elements */}
                                    <div className="absolute top-0 right-0 p-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                        <Shield size={200} />
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

                                    <div className="relative z-10 text-left">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-lg">
                                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-white">
                                                        {abhaProfile.image ? (
                                                            <img src={abhaProfile.image} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-700">
                                                                <User size={32} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold tracking-tight">{abhaProfile.name}</h2>
                                                    <p className="text-teal-100 text-sm font-medium opacity-90">{abhaProfile.gender} • Born {new Date(abhaProfile.dob).getFullYear()}</p>
                                                </div>
                                            </div>

                                            {/* QR Code Section */}
                                            <div className="bg-white p-2 rounded-lg shadow-lg">
                                                {/* Encoded URL for Mobile View - excluding image to keep URL short */}
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                                        `${window.location.origin}/mobile-view?name=${encodeURIComponent(abhaProfile.name)}&no=${abhaProfile.abhaNumber}&addr=${abhaProfile.abhaAddress}&gender=${abhaProfile.gender}&dob=${abhaProfile.dob}&loc=${encodeURIComponent(abhaProfile.address.substring(0, 30))}&uid=${abhaProfile.aadhaar}`
                                                    )}`}
                                                    alt="QR Code"
                                                    className="w-20 h-20"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6 pl-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <p className="text-teal-200 text-xs uppercase tracking-widest font-semibold mb-1">ABHA Number</p>
                                                    <p className="text-3xl font-mono font-bold tracking-widest text-white drop-shadow-sm">{abhaProfile.abhaNumber}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-teal-200 text-xs uppercase tracking-widest font-semibold mb-1">ABHA Address</p>
                                                    <p className="text-xl font-medium tracking-wide text-white">{abhaProfile.abhaAddress}</p>
                                                </div>
                                                <div>
                                                    <p className="text-teal-200 text-xs uppercase tracking-widest font-semibold mb-1">Address</p>
                                                    <p className="text-sm font-medium tracking-wide whitespace-pre-wrap text-teal-50">{abhaProfile.address}</p>
                                                </div>
                                                <div>
                                                    <p className="text-teal-200 text-xs uppercase tracking-widest font-semibold mb-1">Aadhaar</p>
                                                    <p className="text-sm font-medium tracking-wide text-teal-50">{abhaProfile.aadhaar}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                                    <button onClick={handleDownloadCard} className="flex-1 bg-white text-teal-800 border border-teal-200 py-3 rounded-xl font-bold hover:bg-teal-50 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                        <QrCode size={18} /> Download Card
                                    </button>
                                    <button onClick={handleShareProfile} className="flex-1 bg-teal-700 text-white py-3 rounded-xl font-bold hover:bg-teal-800 transition-all shadow-md flex items-center justify-center gap-2">
                                        <Smartphone size={18} /> Share Profile
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Features Section */}
                {step !== 4 && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Shield, title: 'Secure & Private', desc: 'Your health data is shared only with your consent.' },
                            { icon: FileText, title: 'Unified Records', desc: 'Keep all your medical reports in one digital place.' },
                            { icon: Smartphone, title: 'Easy Access', desc: 'Access your history anytime via mobile.' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="text-gray-600" size={24} />
                                </div>
                                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AbhaManagement;
