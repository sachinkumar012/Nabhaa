import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, User, QrCode } from 'lucide-react';

const MobileAbhaCard = () => {
    const [searchParams] = useSearchParams();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const data = {
            name: searchParams.get('name'),
            abhaNumber: searchParams.get('no'),
            abhaAddress: searchParams.get('addr'),
            gender: searchParams.get('gender'),
            dob: searchParams.get('dob'),
            address: searchParams.get('loc'),
            aadhaar: searchParams.get('uid'),
            image: null // Images are too large for QR URLs usually
        };
        setProfile(data);
    }, [searchParams]);

    if (!profile) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-gradient-to-br from-teal-600 to-blue-900 rounded-2xl p-6 text-white text-center relative overflow-hidden shadow-2xl border border-teal-500/30">
                    <div className="absolute top-0 right-0 p-0 opacity-10 transform translate-x-1/4 -translate-y-1/4"><Shield size={180} /></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10 text-left">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-lg">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-white flex items-center justify-center">
                                        <User size={30} className="text-teal-700" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">{profile.name}</h2>
                                    <p className="text-teal-100 text-xs font-medium opacity-90">{profile.gender} • {profile.dob ? new Date(profile.dob).getFullYear() : ''}</p>
                                </div>
                            </div>
                            <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-green-300 shadow-sm">
                                Active
                            </div>
                        </div>

                        <div className="space-y-5 pl-1">
                            <div>
                                <p className="text-teal-200 text-[10px] uppercase tracking-widest font-semibold mb-0.5">ABHA Number</p>
                                <p className="text-2xl font-mono font-bold tracking-widest text-white drop-shadow-sm">{profile.abhaNumber}</p>
                            </div>
                            <div>
                                <p className="text-teal-200 text-[10px] uppercase tracking-widest font-semibold mb-0.5">ABHA Address</p>
                                <p className="text-lg font-medium tracking-wide text-white">{profile.abhaAddress}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-teal-200 text-[10px] uppercase tracking-widest font-semibold mb-0.5">Address</p>
                                    <p className="text-xs font-medium tracking-wide text-teal-50 truncate">{profile.address}</p>
                                </div>
                                <div>
                                    <p className="text-teal-200 text-[10px] uppercase tracking-widest font-semibold mb-0.5">Aadhaar</p>
                                    <p className="text-xs font-medium tracking-wide text-teal-50">{profile.aadhaar}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-center text-gray-500 text-xs mt-6">Verified by Nabhaa Health Mart</p>
            </div>
        </div>
    );
};

export default MobileAbhaCard;
