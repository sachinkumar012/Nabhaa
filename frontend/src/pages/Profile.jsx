import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Activity, Ruler, Weight, Save, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        dob: '',
        bloodGroup: '',
        height: '',
        weight: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [isEditing, setIsEditing] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                gender: user.gender || '',
                dob: user.dob || '',
                bloodGroup: user.bloodGroup || '',
                height: user.height || '',
                weight: user.weight || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                pincode: user.pincode || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API update
        setTimeout(() => {
            login({ ...user, ...formData }); // Update local context
            setIsLoading(false);
            alert('Profile updated successfully!');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    {/* Header Background */}
                    <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <User size={40} />
                                    </div>
                                </div>
                                <button className="absolute bottom-0 right-0 bg-primary-500 text-white p-1.5 rounded-full shadow-md hover:bg-primary-600 transition-colors">
                                    <Camera size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 px-8 pb-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{formData.name || 'User Name'}</h1>
                                <p className="text-gray-500">{formData.phone || '+91 XXXXX XXXXX'}</p>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-all shadow-sm disabled:opacity-70"
                            >
                                {isLoading ? 'Saving...' : (
                                    <>
                                        <Save size={18} />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Personal Details */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <User size={20} className="text-primary-500" />
                                    Personal Details
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all bg-white"
                                            >
                                                <option value="">Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Health Vitals */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <Activity size={20} className="text-primary-500" />
                                    Health Vitals
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                                        <div className="relative">
                                            <Ruler size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                name="height"
                                                value={formData.height}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                                                placeholder="175"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                        <div className="relative">
                                            <Weight size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                                                placeholder="70"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                        <select
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all bg-white"
                                        >
                                            <option value="">Select</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Address Details */}
                            <div className="space-y-6 md:col-span-2">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <MapPin size={20} className="text-primary-500" />
                                    Address Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all resize-none"
                                            placeholder="House No, Street, Area"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                                            placeholder="Nabha"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                                            placeholder="147201"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
