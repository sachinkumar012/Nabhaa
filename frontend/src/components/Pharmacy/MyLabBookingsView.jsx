import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, Package, Activity } from 'lucide-react';

const MyLabBookingsView = ({ user, onBack }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                let url = `${import.meta.env.VITE_API_URL}/api/lab-tests/my-bookings`;
                const params = new URLSearchParams();
                if (user?.id) params.append('userId', user.id);
                if (user?.email) params.append('email', user.email);

                const response = await fetch(`${url}?${params.toString()}`);
                const data = await response.json();

                if (data.success) {
                    setBookings(data.data);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                console.error("Error fetching bookings:", err);
                setError("Failed to load bookings");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBookings();
        } else {
            setLoading(false);
            setError("Please log in to view updated bookings.");
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm border-b border-gray-200">
                <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">My Lab Test Bookings</h1>
                </div>
            </div>

            <div className="container mx-auto max-w-3xl px-4 py-8">
                {loading ? (
                    <div className="text-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#115E59] mx-auto"></div></div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">{error}</div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-gray-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                            <Activity size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Bookings Found</h3>
                        <p className="text-gray-500 mb-6">You haven't booked any lab tests yet.</p>
                        <button onClick={onBack} className="text-[#115E59] font-bold hover:underline">Browse Tests</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(booking => (
                            <div key={booking._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {booking.status}
                                            </span>
                                            <span className="text-xs text-gray-400">ID: {booking._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{booking.test?.title || 'Unknown Test'}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-[#115E59]">₹{booking.test?.price}</div>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-[#115E59]" />
                                        <span>Booked for: <strong>{new Date(booking.createdAt).toLocaleDateString()}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package size={16} className="text-[#115E59]" />
                                        <span>Patient: <strong>{booking.patientDetails?.name}</strong></span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLabBookingsView;
