import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Calendar, Mail, FileText } from 'lucide-react';

const LabBookingModal = ({ test, user, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    // Auto-fill from user details
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                phone: user.phone || '', // Check what property phone is stored in
                email: user.email || '',
                address: user.address || '',
                // If gender/age are available in user profile, fill them too
                gender: user.gender || 'Male',
                // Calculate age if DOB is available, else leave blank
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(formData, test);
        setLoading(false);
    };

    if (!test) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>

                <div className="p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Book {test.title}</h2>
                        <p className="text-gray-500 text-sm mt-1">Please confirm patient details</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Patient Details</label>

                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Full Name"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#115E59] focus:ring-0 outline-none transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    required
                                    placeholder="Age"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#115E59] outline-none"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                />
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#115E59] outline-none bg-white"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Contact Info</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    required
                                    placeholder="Phone Number"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#115E59] outline-none"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="Email for Report"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#115E59] outline-none"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Collection Details</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                                <textarea
                                    required
                                    placeholder="Full Address"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#115E59] outline-none resize-none h-20"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#115E59] outline-none"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                            <div className="relative">
                                <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
                                <textarea
                                    placeholder="Any specific instructions or medical history..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#115E59] outline-none resize-none h-20"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#115E59] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0d4a46] transition-all transform active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Booking...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Confirm Booking</span>
                                        <span>•</span>
                                        <span>₹{test.price}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LabBookingModal;
