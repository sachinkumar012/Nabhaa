import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { User, Mail, MapPin, Briefcase, Award, Save, Camera } from 'lucide-react';

const DoctorProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('doctorToken');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await api.get('/doctors/profile', config);
                setProfile(data);
            } catch (error) {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 h-32 relative">
                    <div className="absolute -bottom-12 left-8 border-4 border-white rounded-2xl overflow-hidden shadow-lg">
                        <img 
                            src={profile?.image || 'https://via.placeholder.com/150'} 
                            alt="avatar" 
                            className="w-24 h-24 object-cover"
                        />
                        <button className="absolute bottom-0 right-0 bg-blue-600 p-1 text-white rounded-tl-lg">
                            <Camera size={14} />
                        </button>
                    </div>
                </div>
                
                <div className="pt-20 px-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ProfileField icon={User} label="Full Name" value={profile?.name} />
                        <ProfileField icon={Mail} label="Email Address" value={profile?.email} />
                        <ProfileField icon={Award} label="Specialization" value={profile?.specialty} />
                        <ProfileField icon={Briefcase} label="Experience" value={profile?.experience} />
                        <ProfileField icon={MapPin} label="Location" value={profile?.location} />
                    </div>

                    <div className="mt-12 flex gap-4">
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Save size={18} /> Update Profile
                        </button>
                        <button className="text-gray-500 font-bold hover:bg-gray-50 px-8 py-3 rounded-2xl transition-colors">
                            Change Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileField = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="p-3 bg-gray-50 text-gray-400 rounded-xl">
            <Icon size={20} />
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-gray-800 font-semibold">{value || 'Not provided'}</p>
        </div>
    </div>
);

export default DoctorProfile;
